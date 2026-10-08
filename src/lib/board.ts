// The board snapshot: everything the site says about where the project stands.
//
// The specification's report reads every repository a version is satisfied in
// and publishes one file, `board.json`, as an asset of its rolling `board`
// release. Its shape is documented in the spec's
// `70-operations/board-format.md`, and `format` names which shape a file is in.
// This reads it at build time and refuses one it cannot: a snapshot that cannot
// be fetched, is not JSON, or names a format this site does not know fails the
// build, and the published site stays as it was. No committed copy stands in.
//
// `BOARD_SNAPSHOT` names another source, a URL or a path, for a build that must
// read a particular file: local work without a network, or a test.

import { readFile } from "node:fs/promises";

/** Where the newest snapshot is published. */
export const BOARD_URL =
  "https://github.com/lemonfiber/spec/releases/download/board/board.json";

/** The one shape of `board.json` this site reads. */
export const FORMAT = 1;

const TIMEOUT_MS = 30_000;

export type Verdict =
  "met" | "unmarked" | "uncited" | "claimed" | "unknown" | "open";

export interface Claim {
  repo: string;
  number: number;
  url: string;
  draft: boolean;
}

export interface Goal {
  id: string;
  verdict: Verdict;
  cited_in: string[];
  done_in: string[];
  partial_in: string[];
  landed_in: string[];
  claims: Claim[];
}

export interface Version {
  version: string;
  status: string;
  milestone: string | null;
  delivers: string | null;
  released_on: string | null;
  released_as: string | null;
  repos: string[];
  satisfied_in: string[];
  prereleases: Record<string, unknown>[];
  goals: Goal[];
}

export interface Area {
  id: string;
  name: string | null;
  directory: string;
}

export interface Feature {
  id: string;
  title: string;
  area: string;
  audience: string;
  kind: string;
  status: string;
  maturity: string;
  shipped: string | null;
  priority: string | null;
  labels: string[];
  requires: string[];
  relates: string[];
  path: string;
  versions: { version: string; status: string }[];
}

export interface Requirement {
  id: string;
  owner: string;
  namespace: string;
  keyword: "MUST" | "SHOULD" | "MAY" | null;
  text: string;
  status: "accepted" | "draft" | "withdrawn" | "superseded";
  replaced_by: string | null;
  versions: string[];
}

export interface TrackerRow {
  id: string;
  state: "done" | "partial" | "open";
  evidence: string[];
  landed: string | null;
  /** The file in its repository the row is kept in. */
  path: string;
}

export interface Tracker {
  repo: string;
  present: boolean;
  rows: TrackerRow[];
}

export interface Pull {
  repo: string;
  number: number;
  url: string;
  title: string | null;
  author: string | null;
  bot: boolean;
  draft: boolean;
  created_at: string | null;
  updated_at: string | null;
  head: string | null;
  /** When its newest commit was made. */
  last_commit_at: string | null;
  /** A draft with no commit for longer than the report allows a claim to idle. */
  stale: boolean;
  cites: string[];
}

/** A goal more than one open pull request from people or agents cites. */
export interface Contested {
  id: string;
  /** Each as `repo#number`. */
  pulls: string[];
}

export interface BoardRepo {
  name: string;
  group: string | null;
  lang: string | null;
  note: string | null;
  pages: string[];
  /** Null, as are the two below, where its pull requests were not read. */
  open_pulls: number | null;
  /** The open pull requests from people and agents, which the cap counts. */
  counted_pulls: number | null;
  over_cap: boolean | null;
  tracker: "present" | "absent" | "unread" | null;
}

export interface ReleaseEntry {
  summary: string | null;
  requirements: string[];
  reference: string | null;
}

export interface BoardRelease {
  version: string;
  tag: string | null;
  released_on: string | null;
  delivers: string | null;
  groups: { title: string | null; entries: ReleaseEntry[] }[];
}

export interface Proposal {
  kind: "feature" | "requirement" | "rfc";
  id: string | number;
  title: string;
  url: string | null;
}

/** A command of the developer command line, as its `commands.json` lists it. */
export interface Tool {
  name: string;
  purpose: string;
}

export interface Board {
  format: typeof FORMAT;
  generated_at: string;
  ref: string;
  sources: Record<string, string>;
  unread: { repo: string; reason: string }[];
  areas: Area[];
  features: Feature[];
  requirements: Requirement[];
  versions: Version[];
  trackers: Tracker[];
  pulls: Pull[];
  /** The rules the report flags claims by. */
  claims: { cap: number; stale_days: number };
  contested: Contested[];
  repos: BoardRepo[];
  releases: BoardRelease[];
  proposals: Proposal[];
  /** Every command of `lfdev`; the commit read is `sources["tool-lfdev"]`. */
  tools: Tool[];
}

/** The fields every snapshot carries as a list. */
const LISTS = [
  "unread",
  "areas",
  "features",
  "requirements",
  "versions",
  "trackers",
  "pulls",
  "contested",
  "repos",
  "releases",
  "proposals",
  "tools",
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isVersion(v: unknown): v is Version {
  return (
    isRecord(v) &&
    typeof v.version === "string" &&
    typeof v.status === "string" &&
    (typeof v.milestone === "string" || v.milestone === null) &&
    Array.isArray(v.goals)
  );
}

/**
 * A parsed snapshot, refused unless it is in the one format this site reads
 * and carries every field the format documents.
 *
 * The versions are checked row by row because every page counts them; the
 * rest is held to the format's word. A format that changed what a field means
 * raised its number, and that is what the first check is for.
 */
export function parseBoard(json: unknown): Board {
  if (!isRecord(json)) throw new Error("board.json is not an object");
  if (json.format !== FORMAT) {
    throw new Error(
      `board.json is format ${JSON.stringify(json.format)}; this site reads format ${FORMAT}`,
    );
  }
  if (typeof json.generated_at !== "string" || !isRecord(json.sources)) {
    throw new Error("board.json names no time or no sources");
  }
  if (!isRecord(json.claims)) {
    throw new Error("board.json names no rules for claims");
  }
  const missing = LISTS.filter((field) => !Array.isArray(json[field]));
  if (missing.length > 0) {
    throw new Error(`board.json carries no list for ${missing.join(", ")}`);
  }
  const versions = json.versions as unknown[];
  const unreadable = versions.findIndex((v) => !isVersion(v));
  if (unreadable !== -1) {
    throw new Error(`board.json versions[${unreadable}] is not a version`);
  }
  return json as unknown as Board;
}

async function fetchSnapshot(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

/** The text of the snapshot, from `source` or the published address. */
export function readSnapshot(
  source: string = process.env.BOARD_SNAPSHOT || BOARD_URL,
): Promise<string> {
  return /^https?:\/\//.test(source)
    ? fetchSnapshot(source)
    : readFile(source, "utf8");
}

let loaded: Promise<Board> | undefined;

/** The snapshot, read once per build; a build that cannot read it fails. */
export function loadBoard(): Promise<Board> {
  loaded ??= readSnapshot().then((text) => parseBoard(JSON.parse(text)));
  return loaded;
}
