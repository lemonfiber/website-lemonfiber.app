// The version train, read out of the specification's generated feature board.
// The features themselves are published by docs.lemonfiber.app; this file reads
// the board's JSON, not its prose, and links each feature there. Same rule as
// github.ts — a failed fetch falls back to empty, never a broken build.

import { getJSON } from "./github";

const ORG = "lemonfiber";
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
