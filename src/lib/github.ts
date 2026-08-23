// The motor. Everything dynamic on the site is assembled here at BUILD TIME,
// from the GitHub org and the Markdown file the maintainers already keep
// current (lemonfiber/IMPLEMENTATION-STATUS.md). Nothing here runs in the
// browser — the output is baked into static HTML.
//
// Design rule: no single failure may break the build. Every fetch is wrapped,
// times out fast, and falls back to the committed seed. A maintainer never has
// to touch this site; when they push, CI rebuilds and the numbers move.

import type {
  Deliverable,
  DeliverableStatus,
  Issue,
  Milestone,
  Release,
  Repo,
  SiteData,
} from "./types";
import { seedMilestones, seedRepos } from "../data/seed";
import { seedReleases } from "../data/seed-releases";

const ORG = "lemonfiber";
const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";
const TIMEOUT_MS = 8000;

// The file the milestone figures are derived from.
const STATUS_FILE = `${RAW}/${ORG}/lemonfiber/main/IMPLEMENTATION-STATUS.md`;

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "lemonfiber-website-build",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

// ── Local response cache ──────────────────────────────────────────
//
// Unauthenticated GitHub allows 60 API calls an hour per IP, and one build
// spends one per repository plus two. That is a handful of builds before the
// site silently falls back to the seed — which it does correctly, but a developer iterating on layout should
// not have to notice. Responses are cached on disk between builds so repeated
// local builds cost nothing.
//
// Deliberately off in CI: a deploy must reflect the org as it is right now, and
// a cache that can serve a stale roadmap to production defeats the point of
// generating the site from the org at all. Set LF_NO_CACHE=1 to skip it
// locally too.
const CACHE_DIR = ".astro/.fetch-cache";
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_ON = !process.env.CI && !process.env.LF_NO_CACHE;

async function cacheRead(key: string): Promise<string | null> {
  if (!CACHE_ON) return null;
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(`${CACHE_DIR}/${key}.json`, "utf8");
    const { at, body } = JSON.parse(raw) as { at: number; body: string | null };
    return Date.now() - at < CACHE_TTL_MS ? (body ?? "\u0000null") : null;
  } catch {
    return null;
  }
}

async function cacheWrite(key: string, body: string | null): Promise<void> {
  if (!CACHE_ON) return;
  try {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(
      `${CACHE_DIR}/${key}.json`,
      JSON.stringify({ at: Date.now(), body }),
    );
  } catch {
    // A cache that cannot be written is not an error worth failing a build for.
  }
}

// Stable, filesystem-safe key for a URL.
function cacheKey(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 180);
}

// Fetches text, via the cache when it is on. A cached *failure* is stored too —
// as a null body — so a rate-limited build does not retry every dead call on
// every subsequent build within the TTL.
async function fetchText(
  url: string,
  withHeaders: boolean,
): Promise<string | null> {
  const key = cacheKey(url);
  const hit = await cacheRead(key);
  if (hit !== null) return hit === "\u0000null" ? null : hit;

  let body: string | null = null;
  try {
    const res = await fetch(url, {
      ...(withHeaders ? { headers: headers() } : {}),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) body = await res.text();
  } catch {
    body = null;
  }
  await cacheWrite(key, body);
  return body;
}

export async function getJSON<T>(url: string): Promise<T | null> {
  const body = await fetchText(url, true);
  if (body === null) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export async function getText(url: string): Promise<string | null> {
  return fetchText(url, false);
}

/** What a set of parts amounts to: all of them, some of them, or none. */
function rollupStatus(done: number, total: number): DeliverableStatus {
  if (total > 0 && done === total) return "done";
  return done === 0 ? "todo" : "partial";
}

const EMOJI: Record<string, DeliverableStatus> = {
  "✅": "done",
  "◐": "partial",
  "☐": "todo",
};

/**
 * What a milestone's rows add up to, counted rather than weighted.
 *
 * A row is done or it is not. A partial row used to count as a quarter of one,
 * which put a figure on this page that the file it came from does not contain
 * — and which the documentation site, reading the same file, does not agree
 * with. Group headings are section titles rather than work items, so they are
 * excluded from every count.
 */
function rollup(deliverables: Deliverable[]): {
  done: number;
  total: number;
  pct: number;
  status: DeliverableStatus;
} {
  const items = deliverables.filter((d) => !d.group);
  const done = items.filter((d) => d.status === "done").length;
  const total = items.length;
  return {
    done,
    total,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
    status: rollupStatus(done, total),
  };
}

// ── Markdown parsing ──────────────────────────────────────────────

function cleanCell(s: string): string {
  return (
    s
      .replace(/`([^`]*)`/g, "$1") // strip inline code
      .replaceAll(/\[([^\]]{1,200})\]\([^)]{0,500}\)/g, "$1") // link → text
      .replaceAll("**", "")
      // Markdown escapes are for the Markdown renderer, not for us. `\*arr`
      // means a literal asterisk; carrying the backslash through would print it.
      .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, "$1")
      .replace(/\s+/g, " ") // collapse runs, so joined prose lines read cleanly
      .trim()
  );
}

// Parse IMPLEMENTATION-STATUS.md into per-milestone deliverables. Column order
// varies between milestone tables, so we locate cells by shape, not position.
/** One table row as a deliverable, or nothing where the row is not one. */
function rowToDeliverable(row: string): Deliverable | null {
  const cells = row
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
  if (cells.length < 2) return null;
  // header and separator rows
  if (/^-+$/.test(cells[0].replace(/[:\s]/g, "")) || cells[0] === "")
    return null;
  if (/^deliverable$/i.test(cells[0])) return null;

  let status: DeliverableStatus | null = null;
  let spec: string | undefined;
  const rest: string[] = [];
  for (const c of cells.slice(1)) {
    const emoji = Object.keys(EMOJI).find((e) => c.includes(e));
    if (emoji && !status) {
      status = EMOJI[emoji];
    } else if (!spec && /^[A-Z][A-Z\d]*-[A-Za-z]*\d/.test(cleanCell(c))) {
      spec = cleanCell(c).split(/[,·]/)[0].trim();
    } else {
      rest.push(cleanCell(c));
    }
  }
  const note = rest.findLast(Boolean);
  return { title: cleanCell(cells[0]), status: status ?? "todo", spec, note };
}

/** A `###` heading inside a milestone, which groups the rows beneath it. */
function rowToGroup(row: string): Deliverable | null {
  const title = cleanCell(row.slice(4)).replace(/^\d+\s*—\s*/, "");
  return title ? { title, status: "todo", group: true } : null;
}

/** One line of a milestone section, whichever of the two shapes it is.
 *
 * A `###` heading is kept as a deliverable so the roadmap can render the
 * structure the status file actually has, flagged so it never counts toward
 * progress. Anything that is not a heading or a table row is neither.
 */
function parseRow(row: string): Deliverable | null {
  if (row.startsWith("### ")) return rowToGroup(row);
  if (row.startsWith("|")) return rowToDeliverable(row);
  return null;
}

/** What one milestone section of the status file says about itself. */
interface Section {
  id: string;
  title: string;
  // The mark on the heading itself. A heading and the table under it answer
  // different questions: the rows say what has been recorded here, the heading
  // says where the milestone stands including work recorded in another
  // milestone's table. The heading is the milestone's status, and it is what
  // the documentation site shows, so the two cannot disagree.
  declared: DeliverableStatus | null;
  deliverables: Deliverable[];
}

function markOf(line: string): DeliverableStatus | null {
  const emoji = Object.keys(EMOJI).find((e) => line.includes(e));
  return emoji ? EMOJI[emoji] : null;
}

const ID = /^M[\d.]+$/;
const NAMED = " — ";
const MARKED = " · ";

/**
 * `## M4 — Seed & backup · ◐` read as its three parts.
 *
 * The name comes from here rather than from a constant in this repo: a
 * milestone renamed upstream used to keep its old name on this page
 * indefinitely. Split rather than matched, so no pattern has to describe a
 * heading whose title may itself contain either separator.
 */
function headingOf(line: string): { id: string; title: string } | null {
  if (!line.startsWith("## ")) return null;
  const at = line.indexOf(NAMED);
  if (at === -1) return null;
  const id = line.slice(3, at);
  if (!ID.test(id)) return null;
  const named = line.slice(at + NAMED.length);
  const marked = named.lastIndexOf(MARKED);
  return { id, title: cleanCell(marked === -1 ? named : named.slice(0, marked)) };
}

function parseStatus(md: string): Section[] {
  const out: Section[] = [];
  for (const section of md.split(/\n(?=##\s+M\d)/)) {
    const line = section.split("\n")[0];
    const heading = headingOf(line);
    if (!heading) continue;
    const deliverables: Deliverable[] = [];
    for (const row of section.split("\n")) {
      const parsed = parseRow(row.trim());
      if (parsed) deliverables.push(parsed);
    }
    out.push({ ...heading, declared: markOf(line), deliverables });
  }
  return out;
}

/**
 * Every milestone, from the status file when it was reachable.
 *
 * The file names them, orders them, marks them and holds their rows, so nothing
 * about a milestone is kept here — this repo used to carry their names and used
 * to carry eight of them, and both fell behind. The committed snapshot is the
 * offline fallback it was always meant to be, and nothing more.
 */
function buildMilestones(statusMd: string | null): Milestone[] {
  const parsed = statusMd ? parseStatus(statusMd) : [];
  if (parsed.length === 0) return seedMilestones;
  return parsed.map((section) => {
    const r = rollup(section.deliverables);
    return {
      id: section.id,
      title: section.title,
      status: section.declared ?? r.status,
      done: r.done,
      total: r.total,
      pct: r.pct,
    };
  });
}

// ── GitHub API ────────────────────────────────────────────────────

interface ApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string;
  archived: boolean;
}

async function fetchRepos(): Promise<{ repos: Repo[]; stars: number } | null> {
  const api = await getJSON<ApiRepo[]>(
    `${API}/orgs/${ORG}/repos?per_page=100&type=public&sort=pushed`,
  );
  if (!api) return null;
  const byName = new Map(api.map((r) => [r.name, r]));
  const stars = api.reduce((n, r) => n + (r.stargazers_count || 0), 0);

  // Keep the seed's curated order + roles; overlay live metrics.
  //
  // `latestRelease` is deliberately NOT fetched here. It used to cost one
  // `releases/latest` request per repo on top of this one, and fetchReleases
  // already pulls the full release list — so the tag is back-filled from that
  // instead, halving the request count against an unauthenticated rate limit.
  const repos = seedRepos.map((seed) => {
    const live = byName.get(seed.name);
    if (!live) return seed;
    return {
      ...seed,
      description: live.description || seed.description,
      language: live.language || seed.language,
      url: live.html_url,
      homepage: live.homepage || undefined,
      stars: live.stargazers_count,
      openIssues: live.open_issues_count,
      pushedAt: live.pushed_at,
    } satisfies Repo;
  });
  return { repos, stars };
}

interface ApiIssue {
  title: string;
  html_url: string;
  number: number;
  created_at: string;
  repository_url: string;
  labels: { name: string }[];
  pull_request?: unknown;
  body?: string;
}

function toIssue(i: ApiIssue): Issue {
  return {
    title: i.title,
    url: i.html_url,
    number: i.number,
    repo: i.repository_url.split("/").pop() || "",
    labels: i.labels.map((l) => l.name),
    createdAt: i.created_at,
  };
}

async function fetchGoodFirstIssues(): Promise<Issue[]> {
  const q = encodeURIComponent(
    `org:${ORG} label:"good first issue" state:open is:issue`,
  );
  const data = await getJSON<{ items: ApiIssue[] }>(
    `${API}/search/issues?q=${q}&per_page=12&sort=created`,
  );
  if (!data?.items) return [];
  return data.items.filter((i) => !i.pull_request).map(toIssue);
}

interface ApiRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
}

function toRelease(repo: string, r: ApiRelease): Release {
  return {
    repo,
    tag: r.tag_name,
    name: r.name || r.tag_name,
    url: r.html_url,
    publishedAt: r.published_at as string,
    prerelease: r.prerelease,
  };
}

// Every published release across the org, newest first. The tag and its date
// are what this site shows — the newest version on the front page, the latest
// tag on a repository card, and the recent list on the transparency page. What
// each release contained is documented at docs.lemonfiber.app/project/changelog/.
//
// Drafts are dropped because they are not public. Prereleases are NOT: this
// project is pre-1.0, so every release it has ever made is one, and filtering
// them would show a project that has never shipped, which is simply false.
async function fetchReleases(repos: Repo[]): Promise<Release[]> {
  const perRepo = await Promise.all(
    repos.map(async (repo) => {
      const api = await getJSON<ApiRelease[]>(
        `${API}/repos/${ORG}/${repo.name}/releases?per_page=20`,
      );
      if (!api) return [];
      return api
        .filter((r) => !r.draft && r.published_at)
        .map((r) => toRelease(repo.name, r));
    }),
  );
  return perRepo
    .flat()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

// ── Public entry point ────────────────────────────────────────────

let cached: SiteData | null = null;

export async function getSiteData(): Promise<SiteData> {
  if (cached) return cached;

  const [repoResult, statusMd] = await Promise.all([
    fetchRepos(),
    getText(STATUS_FILE),
  ]);

  const live = repoResult !== null;
  const baseRepos = repoResult?.repos ?? seedRepos;
  const stars = repoResult?.stars ?? 0;

  const milestones = buildMilestones(statusMd);

  // Only hit the search + releases APIs when the org was reachable at all.
  const [goodFirstIssues, liveReleases] = live
    ? await Promise.all([fetchGoodFirstIssues(), fetchReleases(baseRepos)])
    : [[] as Issue[], [] as Release[]];

  // Falls back rather than showing no version at all: a site that names no
  // release reads as "this project has never shipped", which is worse than
  // showing a build-time-old copy of the truth.
  const releases = liveReleases.length ? liveReleases : seedReleases;

  // Back-fill each repo's newest tag from the release list, so the tag shown
  // on a repo card and the tag at the top of the changelog cannot disagree.
  const newestTag = new Map<string, string>();
  for (const r of releases) {
    if (!newestTag.has(r.repo)) newestTag.set(r.repo, r.tag);
  }
  const repos = baseRepos.map((r) => ({
    ...r,
    latestRelease: newestTag.get(r.name) ?? r.latestRelease,
  }));

  const totalDeliverables = milestones.reduce((n, m) => n + m.total, 0);
  const doneDeliverables = milestones.reduce((n, m) => n + m.done, 0);

  cached = {
    generatedAt: new Date().toISOString(),
    live,
    stars,
    repos,
    milestones,
    goodFirstIssues,
    releases,
    latestRelease: releases[0],
    progress: {
      doneMilestones: milestones.filter((m) => m.status === "done").length,
      totalMilestones: milestones.length,
      doneDeliverables,
      totalDeliverables,
      pct: Math.round((doneDeliverables / (totalDeliverables || 1)) * 100),
    },
  };
  return cached;
}
