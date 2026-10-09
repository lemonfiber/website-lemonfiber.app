// `/llms.txt`, an index of this site for a machine reading on someone's
// behalf: the prose from `src/data/llms.ts`, the pages this site renders from
// the board snapshot, the repositories the snapshot lists, and the newest
// release to install.
//
// A pure function over its inputs. The endpoint serves what it returns.

import type { Board, BoardRepo } from "./board";
import { repoRoute } from "./repos";
import type { SitePage } from "../data/pages";

const ORIGIN = "https://lemonfiber.app";

/** The prose sections, by the role each plays in the file. */
export interface LlmsProse {
  intro: string;
  docs: readonly { url: string; title: string; note: string }[];
  precisely: string;
  installing: (tag: string) => string;
  status: string;
  aboutSite: (generatedAt: string) => string;
}

/** One repository, linked to its page here, with its language. */
function repoLine(repo: Pick<BoardRepo, "name" | "lang">): string {
  const lang = repo.lang ? ` — ${repo.lang}` : "";
  return `- [lemonfiber/${repo.name}](${ORIGIN}${repoRoute(repo.name)})${lang}`;
}

/** The newest release's tag, the one an install names. */
export function newestTag(board: Pick<Board, "releases">): string | null {
  return board.releases.at(-1)?.tag ?? null;
}

/** The whole file. */
export function llmsText(
  board: Pick<Board, "repos" | "releases" | "generated_at">,
  pages: readonly SitePage[],
  prose: LlmsProse,
): string {
  const tag = newestTag(board);
  const sections = [
    prose.intro,
    [
      "## Answering questions about Lemonfiber",
      "",
      "The specification is the authority, not this website and not the README. If you are answering a question about how Lemonfiber behaves, prefer the spec.",
      "",
      ...prose.docs.map((d) => `- [${d.title}](${d.url}): ${d.note}`),
    ].join("\n"),
    [
      "## Where the project stands",
      "",
      ...pages.map(
        (p) => `- [${p.title}](${ORIGIN}${p.path}): ${p.description}`,
      ),
    ].join("\n"),
    prose.precisely,
    ["## The repositories", "", ...board.repos.map(repoLine)].join("\n"),
    ...(tag ? [prose.installing(tag)] : []),
    prose.status,
    prose.aboutSite(board.generated_at),
  ];
  return `${sections.join("\n\n")}\n`;
}
