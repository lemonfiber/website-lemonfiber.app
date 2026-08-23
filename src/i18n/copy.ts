// Shared chrome copy. Every user-facing string in the nav, the footer and the
// status furniture belongs here — no prose in those templates.
//
// Page prose is not all here yet. The hand-built content pages still carry
// their own copy inline; they move into i18n/pages.ts as each one is converted
// to the DocPage renderer. Until then this file covers the chrome only.

export const copy = {
  meta: {
    lang: "en",
    tagline: "Self-host your media — without becoming a sysadmin",
    description:
      "A fully open-source, self-hosted media automation stack that sets itself up, runs in the exact slice you need, and proves it's working instead of hoping.",
  },

  nav: {
    home: "Home",
    roadmap: "Roadmap",
    transparency: "Transparency",
    contribute: "Contribute",
    install: "Install",
    docs: "Docs",
    changelog: "Changelog",
    faq: "FAQ",
    colophon: "Colophon",
    skip: "Skip to content",
    theme: "Switch colour theme",
    menu: "Menu",
    github: "Lemonfiber on GitHub",
    discord: "Discord",
  },

  cta: {
    install: "Install Lemonfiber",
    repo: "Source on GitHub",
    spec: "Read the specification",
    discord: "Join the Discord",
    roadmap: "See the roadmap",
    goodFirstIssues: "Good first issues",
  },

  footer: {
    project: "Project",
    source: "Source",
    community: "Community",
    org: "Organisation",
    alsoFrom: "Also from the same workshop",
    license: "Hippocratic License 3.0",
    sourceAvailable: "ethical, source-available",
    colophon: "Colophon",
    builtInOpen: "Built in the open — this page is generated from the org's repos.",
    // Blurbs for the sibling projects listed in data/site.ts.
    beatrax: "Local-first personal finance, on your own machine",
    happklaar: "Dinner sorted, without the weeknight scramble",
  },

  status: {
    eyebrow: "Status",
    // Shown under the progress bar, depending on whether GitHub answered at
    // build time. The distinction matters: a stale number presented as live
    // is the one thing this page must never do.
    liveNote: "Generated from the org at build time.",
    snapshotNote: "GitHub was unreachable at build time — showing the last committed snapshot.",
  },

  roadmap: {
    title: "Roadmap",
    lead: "Every milestone, generated from the implementation status the maintainers already keep current.",
    overall: "Overall progress",
    milestones: "milestones",
    deliverables: "deliverables",
    releasedOn: "Released",
    planned: "Planned",
  },


  changelog: {
    eyebrow: "Releases",
    title: "Changelog",
    lead: "Every published release across the org, generated from the release notes themselves — there is no file here to forget to update.",
    prerelease: "Pre-release",
    assets: "Downloads",
    source: "All releases on GitHub",
    onGitHub: "View on GitHub",
    unavailable: "No releases have been published yet.",
    statReleases: "releases",
    statChanges: "changes",
    statLatest: "latest",
    filterLabel: "Filter the changelog",
    searchLabel: "Search the changelog",
    searchPlaceholder: "Search changes…",
    matchCount: "{n} matching",
    reset: "Clear",
    byType: "By type",
    byRepo: "By repo",
    byComponent: "By component",
    noComponents: "Component tags appear once releases carry conventional-commit scopes.",
    noMatches: "Nothing matches those filters.",
  },



  notFound: {
    title: "That page isn't here.",
    body: "The link may be out of date, or the page may have moved. The front page is a good place to pick the thread back up.",
    cta: "Back to the front page",
  },
};
