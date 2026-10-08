// The parity table on /contribute/: every command of the developer command
// line, with the assist on this site that does the same where there is one
// (GOV-R61). Each command's purpose is read from the board snapshot's `tools[]`,
// which lists `lfdev`'s own `commands.json`; the build fails where this table
// and that list name different commands (`src/lib/assists.ts`).

export interface Assist {
  /** The command, as `lfdev` names it. */
  command: string;
  /** How it is typed, with its arguments. */
  usage: string;
  /** The assist on this site that does the same, where there is one. */
  site: { label: string; href: string } | null;
  /** What it leaves in the organisation. */
  produces: string;
  /** What helps after: a workflow, a bot, or a template. */
  after: string | null;
}

export const assists: Assist[] = [
  {
    command: "next",
    usage: "lfdev next [--repo r] [--area a]",
    site: { label: "Pick something up", href: "/pick/" },
    produces:
      "Nothing until claimed; each unclaimed goal with its feature, repository and how to claim it.",
    after: null,
  },
  {
    command: "claim",
    usage: "lfdev claim <id>",
    site: null,
    produces:
      "A draft pull request in the repository that builds it, opening with an empty signed commit carrying the Spec: line and a sign-off.",
    after:
      "pr-cap says when a repository is at its cap; goal-automations labels it; the board shows the claim on its next run.",
  },
  {
    command: "propose",
    usage: "lfdev propose",
    site: null,
    produces:
      "A pull request in spec adding a Draft proposal with no identifier; a maintainer's approval allocates them.",
    after:
      "proposal-approve allocates the identifiers and moves the proposal in as Draft.",
  },
  {
    command: "gap",
    usage: "lfdev gap",
    site: null,
    produces:
      "The same Draft proposal pull request, saying what the specification does not say.",
    after: "proposal-approve, as for a proposal.",
  },
  {
    command: "doc",
    usage: "lfdev doc <url>",
    site: { label: "Fix a doc", href: "/contribute/fix-a-doc/" },
    produces:
      "Nothing; the repository and file a page is rendered from, to edit there.",
    after:
      "assist comments the citation to use when the pull request has none.",
  },
  {
    command: "status",
    usage: "lfdev status <id> done --evidence <path>",
    site: null,
    produces: "A tracker row in this repository, committed signed.",
    after: "status_check.py in that repository's CI.",
  },
  {
    command: "blocked",
    usage: "lfdev blocked <repo>#<n>",
    site: null,
    produces: "Nothing; a report of what a pull request waits on.",
    after: null,
  },
  {
    command: "checks",
    usage: "lfdev checks <repo>#<n>",
    site: null,
    produces: "Nothing; a pull request's checks as they stand.",
    after: null,
  },
  {
    command: "board",
    usage: "lfdev board [--version v] [--area a]",
    site: { label: "The board", href: "/board/" },
    produces: "Nothing; every feature by maturity.",
    after: null,
  },
  {
    command: "doctor",
    usage: "lfdev doctor",
    site: null,
    produces:
      "Nothing; what this clone still needs to commit the way every repository asks.",
    after: null,
  },
  {
    command: "decide",
    usage: "lfdev decide <decision> --where <link>",
    site: null,
    produces: "A row in spec's decision log, committed signed. A maintainer's.",
    after: null,
  },
  {
    command: "goals",
    usage: "lfdev goals <version> --add <id>",
    site: null,
    produces:
      "A pull request in spec changing what a version promises. A maintainer's.",
    after: "goals-change checks the change against the train.",
  },
];
