// What the repository pages need from the board snapshot: each repository's
// tracker counted by state, its open pull requests against the cap, and the
// goals of the version taking work that its tracker holds.
//
// Pure functions over the snapshot. Components render; nothing here does.

import { posix } from "node:path";
import type {
  Board,
  BoardRepo,
  Goal,
  Pull,
  TrackerRow,
  Version,
} from "./board";
import { repoFile, repoTree, specFile, takingWork } from "./roadmap";

/** A tracker row's states, in the order work moves through them. */
export const ROW_STATES = ["open", "partial", "done"] as const;

/** Everything a repository's page says about it. */
export interface RepoState {
  repo: BoardRepo;
  /** Its tracker's rows, counted by state. */
  rows: Record<TrackerRow["state"], number>;
  pulls: Pull[];
  /** Where its tracker is kept, at the revision read: its one file, or the
   *  directory a tracker split by feature keeps; null where it holds no row. */
  trackerUrl: string | null;
  /** The first version taking work that is satisfied here, with the goals its
   *  tracker holds; null where no version taking work is satisfied here. */
  version: { version: Version; goals: Goal[] } | null;
}

/** A repository's open pull requests split into those the cap counts and the
 *  bots', or null where its pull requests were not read. */
export function againstCap(
  repo: Pick<BoardRepo, "open_pulls" | "counted_pulls">,
): { counted: number; bots: number } | null {
  if (repo.open_pulls === null || repo.counted_pulls === null) return null;
  return {
    counted: repo.counted_pulls,
    bots: repo.open_pulls - repo.counted_pulls,
  };
}

/** Where a tracker is kept, from the file one of its rows names: that file,
 *  or the directory a tracker split by feature keeps its files in. */
export function trackerUrl(
  board: Pick<Board, "sources">,
  repo: string,
  rowPath: string,
): string {
  const directory = posix.dirname(rowPath);
  return directory === "."
    ? repoFile(board, repo, rowPath)
    : repoTree(board, repo, directory);
}

/** What the snapshot says about one repository. */
export function repoState(
  board: Pick<Board, "trackers" | "pulls" | "versions" | "sources">,
  repo: BoardRepo,
): RepoState {
  const rows = board.trackers.find((t) => t.repo === repo.name)?.rows ?? [];
  const kept = rows[0]?.path;
  const counted = { open: 0, partial: 0, done: 0 };
  for (const row of rows) counted[row.state] += 1;
  const held = new Set(rows.map((row) => row.id));
  const version = takingWork(board).find((v) =>
    v.satisfied_in.includes(repo.name),
  );
  return {
    repo,
    rows: counted,
    pulls: board.pulls.filter((p) => p.repo === repo.name),
    trackerUrl: kept === undefined ? null : trackerUrl(board, repo.name, kept),
    version: version
      ? { version, goals: version.goals.filter((g) => held.has(g.id)) }
      : null,
  };
}

/** Every repository of the organisation, in the map's order. */
export function repoStates(
  board: Pick<Board, "repos" | "trackers" | "pulls" | "versions" | "sources">,
): RepoState[] {
  return board.repos.map((repo) => repoState(board, repo));
}

/** A specification page of a repository, which the map names relative to
 *  `30-repos/`, at the revision the snapshot read. */
export function repoPageUrl(
  board: Pick<Board, "sources">,
  page: string,
): string {
  return specFile(board, posix.normalize(`30-repos/${page}`));
}

/** The map that lists every repository, at the revision the snapshot read. */
export function repoMapUrl(board: Pick<Board, "sources">): string {
  return specFile(board, "30-repos/repos.toml");
}
