<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-on-ink.svg">
    <img alt="lemonfiber" src=".github/logo.svg" height="72">
  </picture>
</p>

<h1 align="center">website-lemonfiber.app</h1>

<p align="center">
  The lemonfiber frontpage — a <b>build-in-the-open</b> site whose progress and
  repo state are read from the org, not written by hand.<br>
  Astro, static, self-hosted assets. Zero maintenance for maintainers.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-building-F0C419?labelColor=17160F">
  <img alt="Astro" src="https://img.shields.io/badge/built%20with-Astro-E07A17?labelColor=17160F">
  <img alt="Licence" src="https://img.shields.io/badge/licence-Hippocratic%203.0-17160F">
  <a href="https://scorecard.dev/viewer/?uri=github.com/lemonfiber/website-lemonfiber.app"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/lemonfiber/website-lemonfiber.app/badge"></a>
</p>

---

## The idea

Most project sites rot: the "in progress" list is months stale, the numbers were
typed once and never re-counted, and keeping them honest is a chore nobody signs
up for. This site removes the chore. **The GitHub org is the motor.**

At build time it reads:

- **the org** — repositories, languages, releases, open issues, good-first-issues, stars
- **`lemonfiber/IMPLEMENTATION-STATUS.md`** — per-deliverable status (✅ / ◐ / ☐)
- **the specification's generated feature board** — how many features and
  requirements the spec currently holds

…and renders them. When a maintainer pushes to any of those repos, CI rebuilds
and the site moves. Nobody edits a page to ship a milestone.

If the network is unreachable at build time, a committed snapshot
(`src/data/seed.ts`, `seed-milestones.ts`, `seed-releases.ts`) keeps the build
green — live data always overrides it.

Documentation lives elsewhere. The install guide, the FAQ, the colophon, the
specification, the roadmap and the changelog are published by
[`website-docs.lemonfiber.app`](https://github.com/lemonfiber/website-docs.lemonfiber.app),
which renders pinned revisions instead of live ones — so a reader following
instructions gets the ones that match the release they installed. This site
links there; it does not keep a second copy.

## Pages

| Route | What it shows |
|-------|---------------|
| `/` | The pitch, a live status strip, the "runs in slices" switcher, the 19 services |
| `/transparency` | Every repo, release and open issue — read live from GitHub |
| `/contribute` | Ways to help + live good-first-issues |
| `/404` | The one that says where everything else went |

## Develop

```console
$ npm ci          # or: just install
$ npm run dev     # local dev at http://localhost:4321
$ npm run build   # production build (fetches live org data)
$ npm run links   # every internal link in dist/ resolves to a built route
$ just ci         # type-check + typos + build + links — what CI runs
```

Node — the version in `.nvmrc`, which is what CI installs. `GITHUB_TOKEN` is
optional locally (raises the API rate limit).

`npm ci` is also what turns on this repository's pre-push hook, which refuses a
push that would leave a branch carrying no commit `origin/main` does not — what
pushing the trunk over a feature branch looks like. npm's `prepare` script does
it, so `npm install` and `just install` serve too. A clone nobody has installed
into has no hook: it is `git config core.hooksPath .githooks`, per clone, and git
cannot read `.githooks/` on its own.

## Layout

```
src/lib/github.ts      the motor — fetch + parse, with a resilient fallback
src/lib/spec.ts        the specification's own scale, from its generated board
src/lib/format.ts      shared formatting; src/lib/types.ts the shared shapes
src/data/site.ts       editorial copy; the service / profile / form model
src/data/seed*.ts      offline snapshots — org, milestones, releases
src/i18n/              the site's copy — chrome, front page, content pages
src/layouts/Base.astro the shell every page renders into
src/components/        Nav · Footer · Console · FormsSwitcher · RepoCard · …
src/pages/             index · transparency · contribute · 404
src/styles/tokens.css  design tokens mirrored from lemonfiber/brand
```

## Contributing

This project's spec is **canonical**: every change cites a spec identifier that
already exists. Before your first PR, read [AGENTS.md](AGENTS.md) and the
[contributing guide](https://github.com/lemonfiber/spec/blob/main/50-governance/contributing.md).

## Licence

[Hippocratic License 3.0](LICENSE) — ethical-source, source-available. See the
[rationale](https://github.com/lemonfiber/spec/blob/main/90-appendix/license-rationale.md).

---

<p align="center">
  <a href="https://nightworks.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/nightworks-white.png">
      <img alt="NightWorks.io" src=".github/nightworks-dark.png" height="20">
    </picture>
  </a>
  &nbsp;&middot;&nbsp;<a href="https://discord.nightworks.io"><img alt="Discord" src=".github/discord.svg" height="20"></a>
</p>
