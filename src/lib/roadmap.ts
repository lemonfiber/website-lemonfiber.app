// What the roadmap pages need from the board snapshot: each version's goals
// counted and grouped by verdict, and the address in git of every fact shown.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, Goal, Verdict, Version } from "./board";

const GITHUB = "https://github.com/lemonfiber";

/** The verdicts in the order a bar draws them: what is done, then what is not. */
export const BAR_ORDER: readonly Verdict[] = [
  "met",
  "claimed",
  "unmarked",
  "uncited",
  "unknown",
  "open",
];

/** The verdicts in the order a version's page lists them: what someone can act
 *  on first, and what is met last. */
export const PAGE_ORDER: readonly Verdict[] = [
  "claimed",
  "unmarked",
  "uncited",
  "unknown",
  "open",
  "met",
];

/** The lifecycle states of a version that has gone out. */
export const FINISHED: readonly string[] = ["released", "yanked"];

/** How many of a version's goals have each verdict. */
export function verdictCounts(version: Version): Record<Verdict, number> {
  const counts = Object.fromEntries(BAR_ORDER.map((v) => [v, 0])) as Record<
    Verdict,
    number
  >;
  for (const goal of version.goals) counts[goal.verdict] += 1;
  return counts;
}

/** A version's goals grouped by verdict, in page order, empty groups left out. */
export function goalsByVerdict(
  version: Version,
): { verdict: Verdict; goals: Goal[] }[] {
  return PAGE_ORDER.map((verdict) => ({
    verdict,
    goals: version.goals.filter((g) => g.verdict === verdict),
  })).filter((group) => group.goals.length > 0);
}

/** Whether a version has gone out, and so folds on the roadmap. */
export function finished(version: Version): boolean {
  return FINISHED.includes(version.status);
}

/** A file in `spec` at the revision the snapshot read. */
export function specFile(board: Pick<Board, "sources">, path: string): string {
  return `${GITHUB}/spec/blob/${board.sources.spec ?? "main"}/${path}`;
}

/** The manifest of a version, at the revision the snapshot read. */
export function manifestUrl(
  board: Pick<Board, "sources">,
  version: string,
): string {
  return specFile(board, `70-operations/versions/${version}.toml`);
}

/** Where a requirement is defined in `spec`, at the revision the snapshot read,
 *  or null for one the snapshot's catalogue does not hold. */
export function requirementUrl(
  board: Pick<Board, "sources" | "requirements" | "features">,
  id: string,
): string | null {
  const requirement = board.requirements.find((r) => r.id === id);
  if (!requirement) return null;
  const feature = board.features.find((f) => f.id === requirement.owner);
  const path = feature
    ? `10-functional/features/${feature.path}`
    : requirement.owner;
  return specFile(board, path);
}

/** A citation the report names as `repo@sha`, as the commit's address. */
export function commitUrl(citation: string): string {
  const [repo = "", sha = ""] = citation.split("@");
  return `${GITHUB}/${repo}/commit/${sha}`;
}

/** Where each feature is defined in `spec`, by id, at the revision read. */
export function featureSources(
  board: Pick<Board, "sources" | "features">,
): Record<string, string> {
  return Object.fromEntries(
    board.features.map((f) => [
      f.id,
      specFile(board, `10-functional/features/${f.path}`),
    ]),
  );
}
