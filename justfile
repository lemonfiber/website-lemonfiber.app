# Task runner for the website-lemonfiber.app repo. `just` with no argument lists tasks.
default:
    @just --list

# Install dependencies (clean, lockfile-exact).
install:
    npm ci

# Local dev server with hot reload.
dev:
    npm run dev

# Type-check every .astro / .ts file.
check:
    npm run check

# Full production build — fetches live org data from the GitHub API.
build:
    npm run build

# Preview the built site exactly as it will be served.
preview:
    npm run preview

# Check every internal link in the built site — run it after `just build`.
links:
    npm run links

# Everything CI runs: types, spelling, a real build, and its internal links.
ci: check
    typos
    npm run build
    npm run links
