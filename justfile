# Task runner for the website-lemonfiber.app repo. `just` with no argument lists tasks.
default:
    @just --list

# Install dependencies (clean, lockfile-exact).
install:
    npm ci

# Local dev server with hot reload.
dev:
    npm run dev

# Rewrite every file in the shape prettier says. What `just ci` checks for.
format:
    npm run format

# Type-check every .astro / .ts file.
check:
    npm run check

# Lint every source file, with the type-aware rules on.
lint:
    npm run lint

# Full production build — fetches live org data from the GitHub API.
build:
    npm run build

# Preview the built site exactly as it will be served.
preview:
    npm run preview

# Check every internal link in the built site — run it after `just build`.
links:
    npm run links

# Turn on the repository's own git hooks. Once per clone.
#
# `npm ci` does this too, through npm's `prepare` script, and that is the usual
# route here. This is the same line under a name, for a clone where nothing has
# been installed yet — `core.hooksPath` is per-clone local config and no commit
# can carry it.
hooks:
    git config core.hooksPath .githooks
    @echo "hooks on: .githooks/commit-msg, .githooks/pre-push"

# Everything the `build` job reads — formatting, types, lint, a real build and
# its links — plus spelling, which `hygiene` reads.
#
# It is not CI and does not say it is. The rest of what a pull request here
# starts is forge-side, and these are not here:
#
#   commitlint, dco, attribution,   `.githooks/commit-msg` refuses all four
#   the citation gate               before the push, and `hooks` turns it on
#   hygiene                         actionlint, links, markdown, the invite
#                                   check and shared-files; `typos` below is
#                                   the one of them that is here
#   pins, workflow-pins             ask the forge which commits a pin has not
#                                   taken
#   CodeQL, gitleaks, osv-scanner,  forge-side
#   sonar, label, the reference
#   comment
#
# The build fetches live org data from the GitHub API, so this needs a network.
ci: hooks
    npm run format:check
    just check
    just lint
    typos
    npm run build
    npm run links
