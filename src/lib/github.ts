// The motor. Everything the site reads from the GitHub API is assembled here at
// BUILD TIME: the org's repositories, their releases and the open good first
// issues. How far the version train has got is read from the board snapshot, in
// board.ts. Nothing here runs in the browser — the output is baked into static
// HTML.
//
// Design rule: no single failure may break the build. Every fetch is wrapped,
// times out fast, and falls back to the committed seed. A maintainer never has
// to touch this site; when they push, CI rebuilds and the numbers move.

import type { Issue, Release, Repo, SiteData } from "./types";
import { seedRepos } from "../data/seed";
import { seedReleases } from "../data/seed-releases";

const ORG = "lemonfiber";
const API = "https://api.github.com";
const TIMEOUT_MS = 8000;

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
async function fetchText(url: string): Promise<string | null> {
  const key = cacheKey(url);
  const hit = await cacheRead(key);
  if (hit !== null) return hit === "\u0000null" ? null : hit;

  let body: string | null = null;
  try {
    const res = await fetch(url, {
      headers: headers(),
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
  const body = await fetchText(url);
  if (body === null) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
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

/**
 * A release that is public and dated — the only kind this site shows.
 *
 * A predicate rather than the truthiness test it replaces, because the test was
 * already there and the compiler could not see through it: `toRelease` had to
 * assert a date it had in fact been guaranteed. Saying it here says it once,
 * where the guarantee is actually made.
 */
function published(r: ApiRelease): r is ApiRelease & { published_at: string } {
  return !r.draft && r.published_at !== null;
}

function toRelease(
  repo: string,
  r: ApiRelease & { published_at: string },
): Release {
  return {
    repo,
    tag: r.tag_name,
    name: r.name || r.tag_name,
    url: r.html_url,
    publishedAt: r.published_at,
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
      return api.filter(published).map((r) => toRelease(repo.name, r));
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

  const repoResult = await fetchRepos();

  const live = repoResult !== null;
  const baseRepos = repoResult?.repos ?? seedRepos;
  const stars = repoResult?.stars ?? 0;

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

  cached = {
    generatedAt: new Date().toISOString(),
    live,
    stars,
    repos,
    goodFirstIssues,
    releases,
  };
  return cached;
}
