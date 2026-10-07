// What a feature's page needs from the board snapshot: each requirement it
// defines, the versions locking it with the verdict in each, where each
// repository records it built, and who is working on it — every fact with its
// address in git.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, Pull, Requirement, TrackerRow, Verdict } from "./board";
import { featureOf } from "./features";

const GITHUB = "https://github.com/lemonfiber";
/** `repo:path`, evidence held in another repository, as the trackers write it. */
const ELSEWHERE = /^([a-z0-9][a-z0-9.-]*):(?!:)(.+)$/;

/** One version locking a requirement, and its verdict there. */
export interface Locked {
  version: string;
  status: string;
  verdict: Verdict;
}

/** One piece of evidence a tracker row names, with its address. */
export interface Evidence {
  text: string;
  url: string;
}

/** One repository's record of a requirement. */
export interface Recorded {
  repo: string;
  state: TrackerRow["state"];
  evidence: Evidence[];
  landed: string | null;
}

/** Everything the page says about one requirement. */
export interface RequirementState {
  requirement: Requirement;
  locked: Locked[];
  recorded: Recorded[];
  citedIn: string[];
  claims: Pull[];
}

function number(id: string): number {
  return Number(id.slice(id.lastIndexOf("-R") + 2));
}

/** A Markdown link's text in place of the link, scanned once from the left. */
function unlink(markdown: string): string {
  let out = "";
  let at = 0;
  for (;;) {
    const open = markdown.indexOf("[", at);
    const close = open === -1 ? -1 : markdown.indexOf("]", open);
    if (close === -1) return out + markdown.slice(at);
    const end = markdown[close + 1] === "(" ? markdown.indexOf(")", close) : -1;
    if (end === -1) {
      out += markdown.slice(at, close + 1);
      at = close + 1;
    } else {
      out += markdown.slice(at, open) + markdown.slice(open + 1, close);
      at = end + 1;
    }
  }
}

/** The requirement text without Markdown's link and emphasis syntax. */
export function plainText(markdown: string): string {
  return unlink(markdown)
    .replaceAll("**", "")
    .replaceAll(/(?<!\w)\*|\*(?!\w)/g, "")
    .replaceAll("`", "")
    .trim();
}

/** A path a tracker names as evidence, as a link into the repository at the
 *  revision the snapshot read. */
export function evidenceUrl(
  board: Pick<Board, "sources">,
  repo: string,
  entry: string,
): Evidence {
  const elsewhere = ELSEWHERE.exec(entry);
  const owner = elsewhere?.[1] ?? repo;
  const rest = elsewhere?.[2] ?? entry;
  const test = rest.indexOf("::");
  const path = test === -1 ? rest : rest.slice(0, test);
  const revision = board.sources[owner] ?? "main";
  return { text: entry, url: `${GITHUB}/${owner}/blob/${revision}/${path}` };
}

/** The requirements a feature defines, in number order. */
export function requirementsOf(
  board: Pick<Board, "requirements">,
  feature: string,
): Requirement[] {
  return board.requirements
    .filter((r) => r.owner === feature)
    .sort((a, b) => number(a.id) - number(b.id));
}

/** What the snapshot says about each requirement a feature defines. */
export function featureState(
  board: Pick<
    Board,
    "requirements" | "versions" | "trackers" | "pulls" | "sources"
  >,
  feature: string,
): RequirementState[] {
  return requirementsOf(board, feature).map((requirement) => {
    const goals = board.versions.flatMap((v) =>
      v.goals
        .filter((g) => g.id === requirement.id)
        .map((g) => ({ version: v, goal: g })),
    );
    return {
      requirement,
      locked: goals.map(({ version, goal }) => ({
        version: version.version,
        status: version.status,
        verdict: goal.verdict,
      })),
      recorded: board.trackers.flatMap((t) =>
        t.rows
          .filter((row) => row.id === requirement.id)
          .map((row) => ({
            repo: t.repo,
            state: row.state,
            evidence: row.evidence.map((e) => evidenceUrl(board, t.repo, e)),
            landed: row.landed,
          })),
      ),
      citedIn: [...new Set(goals.flatMap(({ goal }) => goal.cited_in))],
      claims: board.pulls.filter((p) => p.cites.includes(requirement.id)),
    };
  });
}

/** Where a requirement is shown on this site: its feature's page, anchored,
 *  or null for a requirement that belongs to no feature. */
export function requirementPage(
  board: Pick<Board, "features">,
  id: string,
): string | null {
  const feature = featureOf(id);
  return board.features.some((f) => f.id === feature)
    ? `/features/${feature}/#${id}`
    : null;
}
