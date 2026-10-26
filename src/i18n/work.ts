// The copy of the pages about work: the repositories, the pull requests in
// flight, and the goals nobody has picked up.

export const snapshotCopy = {
  asOf: "Read at",
  revision: "spec at",
  sources: "Every repository's revision read",
  unreadNote: "Not read this time, so what they hold is not shown:",
};

export const reposCopy = {
  title: "Repositories",
  description:
    "Every repository of the lemonfiber organisation: what its tracker records built, its open pull requests, and the goals it holds — read from the specification's board snapshot.",
  eyebrow: "The repositories",
  heading: "Every repository, and the work it holds.",
  lead: "Each repository records what it has built in its tracker, and works on more in its open pull requests.",
  map: "The repository map",
  working: "How work moves through the repositories",
  name: "Repository",
  group: "Group",
  tracker: "Tracker",
  rows: "Rows open · partial · done",
  pulls: "Open pull requests",
  trackerState: {
    present: "kept",
    absent: "none",
    unread: "not read",
  } as Record<string, string>,
  noTracker: "not asked for",
  notRead: "not read",
  bot: "bot",
  back: "← Every repository",
  descriptionOf: (name: string) =>
    `${name}: what its tracker records built, its open pull requests, and the goals it holds — read from the specification's board snapshot.`,
  language: "Language",
  pages: "Its specification",
  goalsOf: "Goals of {version} its tracker holds",
  noGoals: "Its tracker holds none of this version's goals yet.",
  noVersion: "No version taking work is satisfied in this repository.",
  trackerFile: "the tracker",
  noPulls: "No open pull request.",
  openPullsOf: "Open pull requests",
};

export const inFlightCopy = {
  title: "In flight",
  description:
    "Every open pull request in the repositories lemonfiber's versions are satisfied in, with what each cites, its age and the goals more than one contests — read from the specification's board snapshot.",
  eyebrow: "Work in flight",
  heading: "Every open pull request, and what it claims.",
  lead: "A pull request claims the requirements its Spec: lines cite. These are the open ones in every repository a version is satisfied in.",
  claiming: "How work is claimed",
  contested: "Goals more than one pull request claims",
  contestedNone: "No goal is claimed twice.",
  pullsIn: "open",
  draft: "draft",
  ready: "ready",
  stale: "stale",
  staleNote: "a draft with no commit for more than {days} days",
  bot: "bot",
  opened: "opened",
  daysAgo: (n: number) => (n === 1 ? "1 day ago" : `${n} days ago`),
  today: "today",
  cites: "cites",
  citesNothing: "cites nothing",
  contests: "contests",
  by: "by",
  none: "No open pull request was read.",
};

export const pickCopy = {
  title: "Pick something up",
  description:
    "The goals of the first two lemonfiber versions still taking work that are not met and that nobody has claimed, by repository and area — read from the specification's board snapshot.",
  eyebrow: "Pick something up",
  heading: "Goals nobody has claimed yet.",
  lead: "The goals of the first two versions on the train still taking work that are not met and that no open pull request cites. Open a pull request whose commits cite one in a Spec: line and it is yours.",
  claiming: "How work is claimed",
  byRepo: "By repository",
  byArea: "By area",
  byVersion: "By version",
  label: {
    version: "Version",
    area: "Area",
    repo: "Repository",
  } as Record<string, string>,
  nowhere: "Not in any tracker yet",
  goals: (n: number) => (n === 1 ? "1 goal" : `${n} goals`),
  none: "Every goal of this version is met or claimed.",
  noVersion: "No version is taking work.",
  roadmap: "on the roadmap",
  filteredTo: "Filtered to",
  all: "← Every goal to pick up",
};

export const claimCopy = {
  title: (id: string) => `Claim ${id}`,
  description: (id: string) =>
    `Who holds ${id}, where it is built and how many pull requests each repository has open, and how to claim it — read from the specification's board snapshot.`,
  eyebrow: "Claim a goal",
  of: (version: string) => `A goal of ${version}`,
  requirement: "The requirement",
  noText: "This snapshot does not carry the requirement's words.",
  met: "This goal is met. There is nothing to claim.",
  held: "Somebody already holds this goal, so it is not offered. Their pull requests:",
  by: "by",
  unknownAuthor: "author not read",
  repos: "Where it is built",
  noRepos: "No repository is named for this version yet.",
  open: (n: number | null) => {
    if (n === null) return "its open pull requests were not read";
    return n === 1 ? "1 open pull request" : `${n} open pull requests`;
  },
  how: "How to claim it",
  command: "With lfdev, from a clone of the repository:",
  orEditor: "Or in GitHub's editor, adding this row to the tracker:",
  edit: (path: string) => `Edit ${path} on GitHub`,
  create: (path: string) => `Create ${path} on GitHub, the row filled in`,
  noEditor:
    "This snapshot does not show how this repository keeps its tracker; lfdev knows.",
  pr: "Open the pull request as a draft, titled:",
  body: "Its body ends with these lines, the sign-off in your own name:",
  rule: "How work is claimed",
  claim: "Claim it",
  holders: "Who holds it",
};
