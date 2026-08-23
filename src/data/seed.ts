import type { Repo } from "../lib/types";

// The org's repositories: every public one, in the order the site shows them,
// each with the role it plays. This list is what the site renders — GitHub
// overlays description, language, stars, issues and push time onto it at build
// time, and a repository missing from here appears nowhere, live or not. The
// committed values are the snapshot a build falls back to when GitHub is
// unreachable, so a build (and local dev without a token) never fails.
//
// The milestone snapshot moved to seed-milestones.ts and the release snapshot
// to seed-releases.ts. Both are re-exported here so existing imports of
// `seedMilestonesRaw` from this module keep resolving.

export { seedMilestonesRaw, type RawMilestone } from "./seed-milestones";
export { seedReleases } from "./seed-releases";

export const seedRepos: Repo[] = [
  {
    name: "spec",
    role: "canonical",
    primary: true,
    description: "The canonical specification — 926 requirements and the why behind every one.",
    language: "Markdown",
    url: "https://github.com/lemonfiber/spec",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "lemonfiber",
    role: "the binary",
    primary: true,
    description: "The Lemonfiber binary: sets up your media stack, runs it in slices, proves it works. Rust.",
    language: "Rust",
    url: "https://github.com/lemonfiber/lemonfiber",
    stars: 0,
    openIssues: 0,
    latestRelease: "v0.8.0",
  },
  {
    name: "lemonfiber-media-stack",
    role: "the stack",
    primary: true,
    description: "The Docker Compose stack it orchestrates — 19 services + the stack.toml manifest.",
    language: "Shell",
    url: "https://github.com/lemonfiber/lemonfiber-media-stack",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "lemonfiber-web",
    role: "the web surface",
    description: "The operator console and household view — a static app that draws the binary's API and implements nothing.",
    language: "TypeScript",
    url: "https://github.com/lemonfiber/lemonfiber-web",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "sdk-ts",
    role: "the TypeScript client",
    description: "Typed calls, a typed event stream and a typed error over the local web API. @lemonfiber/sdk-ts.",
    language: "TypeScript",
    url: "https://github.com/lemonfiber/sdk-ts",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "sdk-php",
    role: "the PHP client",
    description: "The same contract as a peer, not a translation — lemonfiber/sdk-php on Packagist.",
    language: "PHP",
    url: "https://github.com/lemonfiber/sdk-php",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "brand",
    role: "identity",
    description: "Logo, colour and type — design tokens with contrast CI.",
    language: "CSS",
    url: "https://github.com/lemonfiber/brand",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "homebrew-tap",
    role: "generated",
    description: "brew install lemonfiber — a formula written by release CI, not by hand.",
    language: "Ruby",
    url: "https://github.com/lemonfiber/homebrew-tap",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "website-lemonfiber.app",
    role: "this site",
    description: "This frontpage — a build-in-the-open site driven by the org.",
    language: "Astro",
    url: "https://github.com/lemonfiber/website-lemonfiber.app",
    stars: 0,
    openIssues: 0,
  },
  {
    name: "website-docs.lemonfiber.app",
    role: "the docs",
    description: "docs.lemonfiber.app — the task-shaped documentation, plus each repo's own docs pinned and rendered.",
    language: "TypeScript",
    url: "https://github.com/lemonfiber/website-docs.lemonfiber.app",
    stars: 0,
    openIssues: 0,
  },
  {
    name: ".github",
    role: "inherited",
    description: "Community health files, issue templates and the dependency policy every repo inherits.",
    language: "Markdown",
    url: "https://github.com/lemonfiber/.github",
    stars: 0,
    openIssues: 0,
  },
];
