import type { Repo } from "../lib/types";

// The org's repositories: every public one, in the order the site shows them,
// each with the role it plays. This list is what the site renders — GitHub
// overlays description, language, stars, issues and push time onto it at build
// time, and a repository missing from here appears nowhere, live or not. The
// committed values are the snapshot a build falls back to when GitHub is
// unreachable, so a build (and local dev without a token) never fails.
//
// The release snapshot is in seed-releases.ts.

// name, role, language, description — and whatever else that repository has.
// The address follows from the name; the counts start at zero because GitHub
// supplies them.
function seed(
  name: string,
  role: string,
  language: string,
  description: string,
  rest: Partial<Repo> = {},
): Repo {
  return {
    name,
    role,
    language,
    description,
    url: `https://github.com/lemonfiber/${name}`,
    stars: 0,
    openIssues: 0,
    ...rest,
  };
}

export const seedRepos: Repo[] = [
  seed(
    "spec",
    "canonical",
    "Markdown",
    "The canonical specification — every behaviour written down before it is built, and the why behind each one.",
    { primary: true },
  ),
  seed(
    "lemonfiber",
    "the binary",
    "Rust",
    "The lemonfiber tool: sets up your media stack, runs the part you need, and checks that it works.",
    { primary: true, latestRelease: "v0.16.0" },
  ),
  seed(
    "lemonfiber-media-stack",
    "the stack",
    "Shell",
    "The Docker Compose stack it runs, and its stack.toml manifest. Works with plain docker compose too.",
    { primary: true },
  ),
  seed(
    "lemonfiber-request-gate",
    "a stack service",
    "Rust",
    "Lets Seerr ask Sonarr, Radarr and Jellyfin for a fixed set of things, and nothing more.",
  ),
  seed(
    "lemonfiber-decline",
    "a stack service",
    "Rust",
    "Lets somebody turn down an invitation to the household.",
  ),
  seed(
    "lemonfiber-web",
    "the web surface",
    "TypeScript",
    "The operator console and household view — a static app that draws the binary's API and implements nothing.",
  ),
  seed(
    "lemonfiber-companion",
    "the phone app",
    "PHP",
    "The phone app, in development: native on iOS and Android, no web view.",
  ),
  seed(
    "sdk-ts",
    "the TypeScript client",
    "TypeScript",
    "Typed calls, a typed event stream and a typed error over the local web API.",
  ),
  seed(
    "sdk-php",
    "the PHP client",
    "PHP",
    "The same contract implemented as a peer rather than translated.",
  ),
  seed(
    "sdk-python",
    "the Python client",
    "Python",
    "An asynchronous and a synchronous client over the same contract.",
  ),
  seed(
    "integration-home-assistant",
    "Home Assistant",
    "Python",
    "The stack's health, controls and a member's library in Home Assistant.",
  ),
  seed(
    "integration-mcp",
    "AI assistants",
    "Python",
    "An MCP server, so an AI assistant can use the web API through a scoped key.",
  ),
  seed(
    "plugin-template",
    "plugin template",
    "TOML",
    "Copy this to write a plugin. It validates unmodified.",
  ),
  seed(
    "plugin-komga",
    "a plugin",
    "TOML",
    "Komga as a plugin: comics and manga.",
  ),
  seed(
    "plugin-uptime-kuma",
    "a plugin",
    "TOML",
    "Uptime Kuma as a plugin: endpoint monitoring.",
  ),
  seed(
    "plugin-plex",
    "a plugin",
    "TOML",
    "Plex as a plugin: a worked example that cannot be installed yet.",
  ),
  seed(
    "lemonfiber-plugins",
    "the catalogue",
    "TOML",
    "The reviewed catalogue where plugins are listed so people can find them.",
  ),
  seed(
    "brand",
    "identity",
    "CSS",
    "Logo, colour and type — design tokens with contrast CI.",
  ),
  seed(
    "homebrew-tap",
    "placeholder",
    "Ruby",
    "The Homebrew tap. Its formula is a placeholder, so brew install installs nothing yet.",
  ),
  seed(
    "website-lemonfiber.app",
    "this site",
    "Astro",
    "This frontpage — a build-in-the-open site driven by the org.",
  ),
  seed(
    "website-docs.lemonfiber.app",
    "the docs",
    "TypeScript",
    "docs.lemonfiber.app — the task-shaped documentation, and each repo's own docs pinned and rendered.",
  ),
  seed(
    ".github",
    "inherited",
    "Markdown",
    "Community health files and issue templates every repo inherits.",
  ),
];
