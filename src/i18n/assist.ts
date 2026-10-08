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
