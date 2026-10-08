// What the page of work to pick up needs from the board snapshot: the goals of
// the version in flight and the next that nobody has claimed and that are not
// met, each with the repositories whose trackers hold it and its area.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, Verdict, Version } from "./board";
import { plainText, requirementPage } from "./feature-page";
import { featureOf } from "./features";
import { takingWork } from "./roadmap";

/** One goal someone could pick up. */
export interface Pickable {
  id: string;
  version: string;
  verdict: Verdict;
  /** Repositories whose tracker holds it and does not record it done. */
  repos: string[];
  /** Its feature's area, or null for a requirement outside the catalogue. */
  area: string | null;
  text: string | null;
  page: string | null;
}

/** The facets the page of work to pick up is also built as a page for. */
export const PICK_FACETS = ["version", "area", "repo"] as const;
export type PickFacet = (typeof PICK_FACETS)[number];

/** Each version taking work, with its goals nobody has claimed and that are
 *  not met, in the manifest's order. */
export function pickable(
  board: Pick<Board, "versions" | "trackers" | "requirements" | "features">,
): { version: Version; goals: Pickable[] }[] {
  const areaOf = new Map(board.features.map((f) => [f.id, f.area]));
  const textOf = new Map(board.requirements.map((r) => [r.id, r.text]));
  return takingWork(board).map((version) => ({
    version,
    goals: version.goals
      .filter((g) => g.verdict !== "met" && g.claims.length === 0)
      .map((g) => {
        const text = textOf.get(g.id);
        return {
          id: g.id,
          version: version.version,
          verdict: g.verdict,
          repos: board.trackers
            .filter((t) =>
              t.rows.some((row) => row.id === g.id && row.state !== "done"),
            )
            .map((t) => t.repo),
          area: areaOf.get(featureOf(g.id)) ?? null,
          text: text === undefined ? null : plainText(text),
          page: requirementPage(board, g.id),
        };
      }),
  }));
}

/** Goals grouped by the repositories holding them, in name order, those no
 *  tracker holds yet last under null. A goal several hold is under each. */
export function byRepo(
  goals: readonly Pickable[],
): { repo: string | null; goals: Pickable[] }[] {
  const names = [...new Set(goals.flatMap((g) => g.repos))].sort((a, b) =>
    a.localeCompare(b),
  );
  const groups: { repo: string | null; goals: Pickable[] }[] = names.map(
    (repo) => ({ repo, goals: goals.filter((g) => g.repos.includes(repo)) }),
  );
  const nowhere = goals.filter((g) => g.repos.length === 0);
  if (nowhere.length > 0) groups.push({ repo: null, goals: nowhere });
  return groups;
}

/** Whether a goal has a facet's value. */
export function pickMatches(
  goal: Pickable,
  facet: PickFacet,
  value: string,
): boolean {
  if (facet === "repo") return goal.repos.includes(value);
  return goal[facet] === value;
}

/** The values each facet takes across the goals, sorted, for the pages built
 *  per value. */
export function pickFacetValues(
  goals: readonly Pickable[],
): Record<PickFacet, string[]> {
  const sorted = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => v !== null))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  return {
    version: sorted(goals.map((g) => g.version)),
    area: sorted(goals.map((g) => g.area)),
    repo: sorted(goals.flatMap((g) => g.repos)),
  };
}
