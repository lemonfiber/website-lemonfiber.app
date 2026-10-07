// The roadmap pages' copy.
//
// Every verdict has a word and a glyph as well as a colour, so a reader who
// cannot tell the colours apart reads the same thing.

import type { Verdict } from "../lib/board";

export const roadmapCopy = {
  title: "Roadmap",
  description:
    "Every version of lemonfiber on the release train, where each goal stands, and what is being worked on — read from the specification's board snapshot.",
  eyebrow: "The release train",
  heading: "Every version, and where each of its goals stands.",
  lead: "Each version locks a set of requirements as its goals. A goal is met when a merged pull request cites it and a repository records it built; the release gate tags a version only when every goal is met.",
  asOf: "Read at",
  revision: "spec at",
  howItWorks: "How a version is released",
  inFlight: "On the train",
  released: "Released",
  releasedOn: "released",
  goals: "goals",
  serves: "serves",
  manifest: "manifest",
  allGoals: "Every goal",
  back: "← The roadmap",
  noGoals: "This version locks no goals yet.",
  prereleases: "pre-releases cut:",
  doneIn: "done in",
  partialIn: "partial in",
  citedBy: "cited by",
  landedIn: "landed in",
  claimedBy: "claimed by",
  draft: "draft",
  unreadNote:
    "Some repositories could not be read for this snapshot, so goals searched there read unknown:",
  status: {
    planned: "planned",
    staged: "staged",
    in_progress: "in progress",
    releasable: "releasable",
    released: "released",
    yanked: "yanked",
  } as Record<string, string>,
  verdict: {
    met: { word: "met", glyph: "●", heading: "Met" },
    claimed: {
      word: "claimed",
      glyph: "◆",
      heading: "Claimed — an open pull request cites it",
    },
    unmarked: {
      word: "unmarked",
      glyph: "▲",
      heading: "Cited, and recorded built nowhere yet",
    },
    uncited: {
      word: "uncited",
      glyph: "■",
      heading: "Recorded built, and cited by no merged commit",
    },
    unknown: {
      word: "unknown",
      glyph: "?",
      heading: "Unknown — searched in a repository that could not be read",
    },
    open: { word: "open", glyph: "○", heading: "Open — nobody has started" },
  } satisfies Record<Verdict, { word: string; glyph: string; heading: string }>,
};
