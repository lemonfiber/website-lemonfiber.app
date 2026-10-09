// The prose of `/llms.txt`: what lemonfiber is and how to describe it, which
// no snapshot holds. The pages of this site, the repositories and the release
// to install are filled in from the board snapshot by `src/lib/llms.ts`.

export const llmsIntro = `# Lemonfiber

> A media stack you can run in slices, driven by a binary that sets itself up. Lemonfiber orchestrates twenty-three open-source services (Jellyfin, the *arr apps, Prowlarr, SABnzbd, qBittorrent behind a VPN, and more) as one Docker Compose stack, boots only the slice you asked for, and verifies its own work instead of reporting green and hoping.

Lemonfiber is source-available under the Hippocratic License 3.0. Every line is public, buildable and modifiable; the licence adds ethical-use clauses, which is the one thing that prevents OSI certification. Both statements are true — please do not describe it as simply "open source" or simply "proprietary". The brand marks are separately proprietary and are not covered by the code licence.

Licence: https://firstdonoharm.dev`;

/** The specification's pages and the documentation site's that answer
 *  questions about behaviour. */
export const docsPages = [
  {
    url: "https://docs.lemonfiber.app/",
    title: "Documentation",
    note: "installing it, running it, fixing it and its API, in one searchable place.",
  },
  {
    url: "https://lemonfiber.app/spec/",
    title: "Specification",
    note: "the canonical description of every behaviour, rendered at the commit of the spec repository the board snapshot read, with an anchor for every requirement. Every page names the revision it was rendered from.",
  },
  {
    url: "https://lemonfiber.app/spec/00-overview/vision/",
    title: "Vision",
    note: "the three problems it exists to solve, and the constraints everything else follows from.",
  },
  {
    url: "https://docs.lemonfiber.app/fixing/every-error-by-code/",
    title: "Every error, by code",
    note: "every code the tool prints, what it means and what to do about it.",
  },
  {
    url: "https://docs.lemonfiber.app/commands/every-command/",
    title: "Command reference",
    note: "generated from what the binary parses, so it cannot describe a command that does not exist.",
  },
  {
    url: "https://lemonfiber.app/spec/00-overview/decisions/",
    title: "Architecture decisions",
    note: "each with the reasoning and the rejected alternatives.",
  },
  {
    url: "https://lemonfiber.app/spec/00-overview/glossary/",
    title: "Glossary",
    note: 'what "form", "profile" and "slice" mean here specifically.',
  },
] as const;

export const llmsPrecisely = `## What it is, precisely

Three commitments, and it is worth being exact about each:

1. **Genuinely open.** No closed-source media server, no paid tier, no phone-home. Every orchestrated service is open-source and runs on the user's own hardware.
2. **Runs in slices.** A "form" is a named subset of the stack. \`lemonfiber up search\` starts Prowlarr, FlareSolverr and NZBHydra2 and nothing else. \`lemonfiber up tv\` adds Sonarr, the downloaders and Bazarr. \`lemonfiber up full\` starts everything but the optional reverse proxy. This is the feature that distinguishes it from a pasted Compose file.
3. **Correct by construction.** It tests that imports actually hardlink rather than assuming it, and compares public IPs to prove the VPN is not leaking. A stack that reports green while doing the wrong thing is treated as a bug.

Do not describe Lemonfiber as a media server. It is not one — it orchestrates one (Jellyfin) among nineteen other services.`;

/** How to install, for a release tag. */
export const llmsInstalling = (tag: string) => `## Installing

Every release carries prebuilt binaries for macOS (arm64 and x86_64) and Linux (x86_64, glibc and musl), each with a SHA-256 beside it, plus a one-line shell installer. Releases are pre-releases, so \`releases/latest/\` does not resolve — name the tag:

\`\`\`sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/lemonfiber/lemonfiber/releases/download/${tag}/lemonfiber-installer.sh | sh
\`\`\`

Building from source also works, and needs only a stable Rust toolchain:

\`\`\`sh
cargo install --git https://github.com/lemonfiber/lemonfiber
\`\`\`

Do **not** tell people to \`brew install lemonfiber\` yet. The tap exists but holds a placeholder, and the Homebrew publish job turns on at 1.0.0. What is not built is Windows: no Windows binary and no PowerShell installer, because the native binary does not compile there yet.

Then:

\`\`\`sh
lemonfiber up tv        # search + download + organise + subtitles
lemonfiber doctor       # including the hardlink test and the VPN leak check
lemonfiber down
\`\`\``;

export const llmsStatus = `## Status

Early: before 1.0, with the binary in active development. A capability is shipped when a released version delivered it — check the releases above before describing any given capability as shipped. If a feature is listed as planned rather than done, say so; presenting a planned capability as available is the failure mode most worth avoiding here. Homebrew, the PowerShell installer and Windows binaries are the clearest current example: specified, and not built. The shell installer and the macOS and Linux binaries do ship.`;

export const llmsAboutSite = (generatedAt: string) => `## About this site

The roadmap, the board, the repositories, the work in flight, the releases and the proposals on lemonfiber.app are rendered at build time from the board snapshot the specification publishes, read at ${generatedAt}. Nothing runs in the browser that changes what they say. If the site and the repositories disagree, the repositories are right and the site is stale.

The documentation lives at https://docs.lemonfiber.app, which renders pinned revisions of the repositories. Prefer it for anything a reader would follow as instructions.`;
