// The copy of the release pages and the pre-approval feed.

export const releasesCopy = {
  title: "Releases",
  description:
    "Every lemonfiber release: what it delivered, grouped as the core's changelog groups it, with the requirements behind each entry — read from the specification's board snapshot.",
  eyebrow: "The changelog",
  heading: "Every release, and what it delivered.",
  lead: "Each release is recorded in the core's changelog, entry by entry, with the requirements each entry built and the pull request it came in by.",
  changelog: "The changelog",
  releasedOn: "released",
  entries: (n: number) => (n === 1 ? "1 entry" : `${n} entries`),
  none: "No release is recorded yet.",
  back: "← Every release",
  descriptionOf: (version: string) =>
    `What lemonfiber ${version} delivered, entry by entry, with the requirements behind each and the goals it was gated on.`,
  tag: "tag",
  source: "its changelog file",
  gatedOn: "The goals it was gated on",
  noGoals: "No manifest names goals for this version.",
  roadmap: "on the roadmap",
  builds: "builds",
};

export const proposalsCopy = {
  title: "Proposals",
  description:
    "What is under consideration for lemonfiber's specification before it binds: Draft features and requirements, and open RFC issues — read from the specification's board snapshot.",
  eyebrow: "Under consideration",
  heading: "What is proposed, before it binds.",
  lead: "A Draft feature or requirement is in the specification and binds nothing yet; an RFC issue is a proposal a maintainer has still to turn into a pull request.",
  process: "How a proposal gets in",
  kinds: {
    feature: "Draft features",
    requirement: "Draft requirements",
    rfc: "Open RFC issues",
  } as Record<string, string>,
  none: "None.",
  source: "source",
};

export const specCopy = {
  title: "Specification",
  eyebrow: "The specification",
  heading: "What lemonfiber does, requirement by requirement.",
  lead: "The canonical description of every behaviour, authored and checked in the spec repository and rendered here at the commit the board snapshot read, so a requirement's text and its verdict on the board are the same revision.",
  description:
    "lemonfiber's specification, rendered at the commit the board snapshot read, with an anchor for every requirement and a link to edit it in the spec repository.",
  back: "← The specification",
  renderedAt: "Rendered from spec at",
  source: "its source",
  edit: "Edit this page",
};
