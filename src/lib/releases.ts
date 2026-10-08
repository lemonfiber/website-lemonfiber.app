// What the release pages need from the board snapshot: each release the core's
// changelog records, newest first, every entry with the requirements behind it
// and the pull request it came in by, and the goals the release was gated on.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, BoardRelease, Goal } from "./board";
import { repoFile } from "./roadmap";

/** The repository whose changelog the releases are read from. */
const CORE = "lemonfiber";
/** Where the core keeps one JSON file per release. */
const CHANGELOG = "reference/changelog";
/** `#680`: a pull request in the core, as its changelog names one. */
const PULL_REFERENCE = /^#(\d+)$/;

/** Every release, newest first. */
export function newestFirst(board: Pick<Board, "releases">): BoardRelease[] {
  return [...board.releases].reverse();
}

/** The address of the pull request an entry names, or null for an entry that
 *  names none or names something that is not a pull request. */
export function referenceUrl(reference: string | null): string | null {
  const pull = reference ? PULL_REFERENCE.exec(reference) : null;
  return pull ? `https://github.com/lemonfiber/${CORE}/pull/${pull[1]}` : null;
}

/** The changelog file a release is recorded in, at the revision read. */
export function changelogUrl(
  board: Pick<Board, "sources">,
  version: string,
): string {
  return repoFile(board, CORE, `${CHANGELOG}/${version}.json`);
}

/** The goals the version's manifest gated the release on. */
export function gatedOn(
  board: Pick<Board, "versions">,
  version: string,
): Goal[] {
  return board.versions.find((v) => v.version === version)?.goals ?? [];
}

/** How many entries a release records across its groups. */
export function entryCount(release: BoardRelease): number {
  return release.groups.reduce((n, g) => n + g.entries.length, 0);
}
