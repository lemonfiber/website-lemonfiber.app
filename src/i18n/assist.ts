// The copy of the contribution assists: the pages that help compose a change
// a person then makes under their own account. Plain strings throughout, since
// an island's props cross to the browser as data.

export const fixADocCopy = {
  title: "Fix a doc",
  description:
    "Paste the address of a page on the documentation, contributor or project site and see the repository and file it is rendered from, how far behind main that is, and where to edit it.",
  eyebrow: "Fix a doc",
  heading: "Fix the file, not the site.",
  lead: "Every page on the sites is rendered from a file in one of the organisation's repositories, often not the site's own. Paste the page's address to find that file and edit it there.",
  privacy:
    "When you press Find, your browser reads the site's provenance.json and asks GitHub how the file has changed since the page was built. Nothing else is sent, and nothing is sent anywhere else.",
  label: "The page's address",
  placeholder: "https://docs.lemonfiber.app/…",
  find: "Find",
  finding: "Reading the site's provenance…",
  notASite:
    "That is not a page on docs.lemonfiber.app, contribute.lemonfiber.app or lemonfiber.app.",
  unreadable: "The site's provenance could not be read. Try again in a moment.",
  notAPage:
    "The site does not list that page. Check the address, or open the page and copy it from the address bar.",
  repository: "Repository",
  path: "File",
  revision: "Rendered from",
  current: "current with main",
  behindOne: "1 commit behind main",
  behindMany: "{n} commits behind main",
  changed: "the file has changed since, so the page may already be fixed",
  unchanged: "the file is unchanged since",
  notCompared: "not compared with main: GitHub did not answer",
  edit: "Edit it on GitHub",
  rendered: "The file as rendered",
  noscript:
    "The box needs JavaScript. Without it, find the page in the list below, or run `lfdev doc <address>` in a terminal.",
  listHeading: "Every page and its file",
  listLead:
    "Each site's pages as its provenance.json named them when this page was built, grouped by the repository that owns each file.",
  unread: "Its provenance.json could not be read when this page was built.",
  pagesOf: "{n} pages",
  editShort: "Edit",
};

export const proposeCopy = {
  title: "Propose a change",
  description:
    "Compose a proposal for the specification, or report what it does not say, and open it on GitHub under your own account.",
  eyebrow: "Propose a change",
  heading: "Say what it should do.",
  lead: "A proposal is a pull request adding one file to the specification, with no identifier: a maintainer's approval allocates them. Fill this in, check the file it makes, and open it on GitHub, where you commit it under your own account and open the pull request.",
  kind: "What it is",
  kindProposal: "A new or changed behaviour",
  kindGap: "Something the specification does not say",
  area: "Area",
  areaChoose: "Choose one",
  titleLabel: "Title",
  titleHint: "A short phrase naming the capability.",
  amends: "What it amends",
  amendsHint:
    "A feature's identifier, like B3, or a page's path, like 20-architecture/overview.md. A gap names the one that is silent.",
  problem: "The problem",
  problemHint: "What does not work today, and for whom.",
  statements: "The proposed behaviour",
  statementsHint:
    "One statement a line, each using MUST, SHOULD or MAY: The dashboard MUST show each service's state.",
  rationale: "Why",
  rationaleHint: "Why this, and what was considered instead.",
  missing: "What it does not say",
  missingHint: "The question the feature or page leaves unanswered.",
  preview: "The file it makes",
  faults: "Before it can be opened",
  open: "Open it on GitHub",
  steps:
    "GitHub opens its new-file page with the file filled in, and makes you a copy of the specification if you cannot write to it. Commit the file there, signed off as GitHub asks, then open the pull request with this title and body.",
  pullTitle: "Pull request title",
  pullBody: "Pull request body",
  pullBodyHint:
    "Replace the sign-off line with the one GitHub added to your commit, the same name and address. The body becomes the commit on main, so it keeps the Spec: line and the sign-off.",
  noscript:
    "The form needs JavaScript. Without it, edit the file below and open it on GitHub, or run `lfdev propose` or `lfdev gap` in a checkout of spec.",
  plainFilename: "The file's path",
  plainValue: "The file",
  privacy:
    "Nothing you type here leaves your browser until you open it on GitHub, which receives the file in the address.",
};
