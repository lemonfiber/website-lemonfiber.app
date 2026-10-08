// What the page of work in flight needs from the board snapshot: every open
// pull request the report read, grouped by repository, with its age and the
// goals it contests with another.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, BoardRepo, Pull } from "./board";

const DAY_MS = 86_400_000;

/** One open pull request as the page lists it. */
export interface PullRow {
  pull: Pull;
  /** Whole days since it opened, as of when the snapshot was written. */
  age: number | null;
  /** The goals it cites that another open pull request cites too. */
  contested: string[];
}

/** One repository's open pull requests. */
export interface RepoPulls {
  repo: BoardRepo | null;
  name: string;
  pulls: PullRow[];
}

/** Whole days from one time to another, or null without the first. */
export function daysBetween(from: string | null, to: string): number | null {
  if (!from) return null;
  return Math.floor((Date.parse(to) - Date.parse(from)) / DAY_MS);
}

/** Every open pull request, by repository in the map's order, oldest first. */
export function pullsByRepo(
  board: Pick<Board, "pulls" | "repos" | "contested" | "generated_at">,
): RepoPulls[] {
  const contestedBy = new Map<string, string[]>();
  for (const goal of board.contested) {
    for (const key of goal.pulls) {
      contestedBy.set(key, [...(contestedBy.get(key) ?? []), goal.id]);
    }
  }
  const names = [...new Set(board.pulls.map((p) => p.repo))];
  const order = (name: string) => {
    const at = board.repos.findIndex((r) => r.name === name);
    return at === -1 ? board.repos.length : at;
  };
  return names
    .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
    .map((name) => ({
      repo: board.repos.find((r) => r.name === name) ?? null,
      name,
      pulls: board.pulls
        .filter((p) => p.repo === name)
        .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
        .map((pull) => ({
          pull,
          age: daysBetween(pull.created_at, board.generated_at),
          contested: contestedBy.get(`${pull.repo}#${pull.number}`) ?? [],
        })),
    }));
}
