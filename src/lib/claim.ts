// What a goal's claim page needs from the board snapshot (GOV-R57, GOV-R58):
// whether somebody already holds it, each repository it is built in with its
// open pull requests against the cap, and the two ways to claim it — the
// command, and the tracker row to paste in GitHub's editor, with the pull
// request's title and the lines its body ends with (GOV-R62).
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, Verdict } from "./board";
import { plainText, requirementPage } from "./feature-page";
import { featureOf } from "./features";
import { takingWork } from "./roadmap";

const GITHUB = "https://github.com/lemonfiber";
/** Where a repository keeps one tracker file. */
const TRACKER = "status.toml";
/** Where a repository keeps a tracker file per feature. */
const SPLIT = "status/";

/** Somebody's open pull request already citing the goal. */
export interface Holder {
  repo: string;
  number: number;
  url: string;
  author: string | null;
}

/** Where the tracker row is written, in GitHub's editor. */
export interface Editor {
  path: string;
  url: string;
  /** The file does not exist yet, so GitHub's new-file page is opened. */
  creates: boolean;
}

/** One repository the goal is built in. */
export interface ClaimRepo {
  repo: string;
  /** Its open pull requests from people and agents, or null where unread. */
  counted: number | null;
  atCap: boolean;
  /** Null where the snapshot does not say how it keeps its tracker. */
  editor: Editor | null;
}

/** Everything a goal's claim page says. */
export interface ClaimPage {
  id: string;
  version: string;
  verdict: Verdict;
  text: string | null;
  page: string | null;
  holders: Holder[];
  repos: ClaimRepo[];
  cap: number;
  command: string;
  row: string;
  title: string;
  body: string;
}

/** The tracker row a claim adds (D13): the requirement, open. */
export function claimRow(id: string): string {
  return `[[requirement]]\nid = "${id}"\nstate = "open"\n`;
}

/** Where a repository's row for a requirement goes, as its tracker rows show. */
export function editorFor(
  board: Pick<Board, "trackers">,
  repo: string,
  id: string,
): Editor | null {
  const paths = new Set(
    board.trackers.find((t) => t.repo === repo)?.rows.map((r) => r.path) ?? [],
  );
  if (paths.size === 0) return null;
  const split = [...paths].some((p) => p.startsWith(SPLIT));
  const path = split ? `${SPLIT}${featureOf(id)}.toml` : TRACKER;
  if (paths.has(path)) {
    return { path, url: `${GITHUB}/${repo}/edit/main/${path}`, creates: false };
  }
  const query = `filename=${encodeURIComponent(path)}&value=${encodeURIComponent(claimRow(id))}`;
  return { path, url: `${GITHUB}/${repo}/new/main?${query}`, creates: true };
}

/** Every open pull request from a person or agent citing a goal, the report's
 *  claims included, once each. */
export function holders(
  board: Pick<Board, "pulls">,
  id: string,
  claimed: readonly { repo: string; number: number; url: string }[],
): Holder[] {
  const found = new Map<string, Holder>();
  for (const pull of board.pulls) {
    if (pull.bot || !pull.cites.includes(id)) continue;
    found.set(`${pull.repo}#${String(pull.number)}`, {
      repo: pull.repo,
      number: pull.number,
      url: pull.url,
      author: pull.author,
    });
  }
  for (const claim of claimed) {
    const key = `${claim.repo}#${String(claim.number)}`;
    if (!found.has(key)) found.set(key, { ...claim, author: null });
  }
  return [...found.values()];
}

/** A claim page for every goal of each version taking work. */
export function claimPages(
  board: Pick<
    Board,
    | "versions"
    | "trackers"
    | "requirements"
    | "features"
    | "pulls"
    | "repos"
    | "claims"
  >,
): ClaimPage[] {
  const textOf = new Map(board.requirements.map((r) => [r.id, r.text]));
  const countOf = new Map(board.repos.map((r) => [r.name, r.counted_pulls]));
  const cap = board.claims.cap;
  return takingWork(board).flatMap((version) =>
    version.goals.map((goal) => {
      const text = textOf.get(goal.id);
      return {
        id: goal.id,
        version: version.version,
        verdict: goal.verdict,
        text: text === undefined ? null : plainText(text),
        page: requirementPage(board, goal.id),
        holders: holders(board, goal.id, goal.claims),
        repos: version.satisfied_in.map((repo) => {
          const counted = countOf.get(repo) ?? null;
          return {
            repo,
            counted,
            atCap: counted !== null && counted >= cap,
            editor: editorFor(board, repo, goal.id),
          };
        }),
        cap,
        command: `lfdev claim ${goal.id}`,
        row: claimRow(goal.id),
        title: `chore(claim): ${goal.id}`,
        body: `Claiming ${goal.id}.\n\nSpec: ${goal.id}\n\nSigned-off-by: Your Name <you@example.org>`,
      };
    }),
  );
}

/** Whether a claim is offered at all: not for a goal met or already held. */
export function offered(page: Pick<ClaimPage, "verdict" | "holders">): boolean {
  return page.verdict !== "met" && page.holders.length === 0;
}
