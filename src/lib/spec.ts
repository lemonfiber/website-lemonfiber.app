// What the roadmap reads out of the specification: the generated feature board
// and the version train it carries. The documents themselves are published by
// docs.lemonfiber.app; this file reads the board's JSON, not its prose. Same
// rule as github.ts — a failed fetch falls back to empty, never a broken build.

import { getJSON } from "./github";

const ORG = "lemonfiber";
const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";
const SPEC_RAW = `${RAW}/${ORG}/spec/main`;
const DOCS_SPEC = "https://docs.lemonfiber.app/spec";

// Where the documentation site publishes one feature specification. Its routes
// are the file's own path, lower case, without the extension.
const featureHref = (path: string): string =>
  `${DOCS_SPEC}/10-functional/features/${path.replace(/\.md$/, "").toLowerCase()}/`;

// ── Version train (from the board) ────────────────────────────────
//
// The spec's generated board (index.json) carries a `versions` array — every
// release the manifests declare, ordered by semver — and, per feature, which
// versions ship it. The train is that version list, each carrying the features it
// delivers. The list is authoritative rather than inverted from feature
// membership, so the epoch-closing majors (1.0.0, 2.0.0) are present rather than
// dropped. Every version — majors included — carries only its own features: a
// major's scope is its release (area L), not a summary of the minors before it.

interface BoardFeature {
  id: string;
  title: string;
  area: string;
  tracks: string;
  path: string;
  versions?: { version: string; status: string }[];
}

interface BoardVersion {
  version: string;
  epoch: string;
  status: string;
  closes_epoch: string | null;
  goals: number;
}

export interface TrainFeature {
  id: string;
  title: string;
  area: string;
  href: string;
}

export interface TrainVersion {
  version: string;
  epoch: string;
  status: string;
  // The epoch this version closes, if it is a major — its features are then the
  // epoch's whole set rather than its own goal membership.
  closesEpoch: string | null;
  features: TrainFeature[];
}

export async function specVersionTrain(): Promise<TrainVersion[]> {
  const idx = await getJSON<{
    versions?: BoardVersion[];
    features?: BoardFeature[];
  }>(`${SPEC_RAW}/10-functional/features/index.json`);
  if (!idx?.versions || !idx?.features) return [];

  const toFeature = (f: BoardFeature): TrainFeature => ({
    id: f.id,
    title: f.title,
    area: f.area,
    href: featureHref(f.path),
  });

  // Which features each version ships, from their goal membership — the majors
  // now own their release feature (area L), so they carry their own scope like any
  // other version rather than aggregating the epoch.
  const byVersion = new Map<string, TrainFeature[]>();
  for (const f of idx.features) {
    for (const v of f.versions ?? []) {
      (
        byVersion.get(v.version) ?? byVersion.set(v.version, []).get(v.version)!
      ).push(toFeature(f));
    }
  }

  return idx.versions.map((v) => ({
    version: v.version,
    epoch: v.epoch,
    status: v.status,
    closesEpoch: v.closes_epoch ?? null,
    features: byVersion.get(v.version) ?? [],
  }));
}

// ── One feature, and the work that built it ───────────────────────

export interface FeatureWork {
  number: number;
  title: string;
  url: string;
  repo: string;
  merged: boolean;
  mergedAt: string | null;
}

export interface FeatureDetail {
  id: string;
  title: string;
  area: string;
  tracks: string;
  href: string;
  milestones: string[];
  versions: { version: string; status: string }[];
  requires: string[];
  relates: string[];
  work: FeatureWork[];
}

/**
 * Every pull request in the org, indexed by the features its `Spec:` trailer names.
 *
 * Built once and shared by every feature page. The obvious implementation — one
 * search per feature — is both inaccurate and expensive: GitHub tokenises, so
 * `D9-R` matches nothing while a bare `D9` matches anything mentioning it, and
 * sixty-eight searches exhausts the unauthenticated rate limit long before the
 * build finishes. Reading the pull requests once and parsing the trailer is
 * exact and costs a handful of requests.
 *
 * The trailer is required on every change in this project, which is what makes
 * the work findable by requirement at all.
 */
let workIndex: Map<string, FeatureWork[]> | null = null;

// `Spec:` at the head of a line, the rest taken whole and split by the caller.
const TRAILER = /^[ \t]{0,20}Spec:([^\r\n]{1,500})$/gim;
const CITED = /\b([A-Z]{1,3}\d*)-R\d+\b/g;

/** The features a pull request's `Spec:` trailers name. */
function featuresCited(body: string | null): Set<string> {
  const features = new Set<string>();
  for (const [, trailer] of (body ?? "").matchAll(TRAILER)) {
    for (const [, feature] of trailer.matchAll(CITED)) features.add(feature);
  }
  return features;
}

interface ApiPull {
  number: number;
  title: string;
  html_url: string;
  body: string | null;
  merged_at: string | null;
}

// Every repository in the org where a change can land. A `Spec:` trailer is
// required on all of them, so work is only findable by requirement in the ones
// named here.
const INDEXED_REPOS = [
  "lemonfiber",
  "spec",
  "lemonfiber-web",
  "sdk-ts",
  "sdk-php",
  "lemonfiber-media-stack",
  "website-lemonfiber.app",
  "website-docs.lemonfiber.app",
  "brand",
  "homebrew-tap",
  ".github",
];

// A page is only fetched while the one before it came back full, so the bound is
// what a repository may grow to rather than what it costs today.
const MAX_PAGES = 20;

/** Read one repository's pull requests into the index, a page at a time. */
async function indexRepo(
  repo: string,
  index: Map<string, FeatureWork[]>,
): Promise<void> {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const pulls = await getJSON<ApiPull[]>(
      `${API}/repos/${ORG}/${repo}/pulls?state=all&per_page=100&page=${page}`,
    );
    if (!pulls?.length) return;
    for (const pull of pulls) {
      for (const feature of featuresCited(pull.body)) {
        index.set(feature, [
          ...(index.get(feature) ?? []),
          {
            number: pull.number,
            title: pull.title,
            url: pull.html_url,
            repo,
            merged: Boolean(pull.merged_at),
            mergedAt: pull.merged_at,
          },
        ]);
      }
    }
    if (pulls.length < 100) return;
  }
}

export async function featureWorkIndex(): Promise<Map<string, FeatureWork[]>> {
  if (workIndex) return workIndex;
  const index = new Map<string, FeatureWork[]>();

  for (const repo of INDEXED_REPOS) {
    await indexRepo(repo, index);
  }

  for (const rows of index.values()) {
    rows.sort((a, b) => b.number - a.number);
  }
  workIndex = index;
  return index;
}

/** Every feature the board knows, with what shipped it and what it needs. */
export async function specFeatures(): Promise<FeatureDetail[]> {
  const idx = await getJSON<{
    features?: (BoardFeature & {
      milestones?: string[];
      requires?: string[];
      relates?: string[];
    })[];
  }>(`${SPEC_RAW}/10-functional/features/index.json`);

  return (idx?.features ?? []).map((f) => ({
    id: f.id,
    title: f.title,
    area: f.area,
    tracks: f.tracks,
    href: featureHref(f.path),
    milestones: f.milestones ?? [],
    versions: f.versions ?? [],
    requires: f.requires ?? [],
    relates: f.relates ?? [],
    work: [],
  }));
}
