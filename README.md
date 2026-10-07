<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-on-ink.svg">
    <img alt="lemonfiber" src=".github/logo.svg" height="72">
  </picture>
</p>

<h1 align="center">website-lemonfiber.app</h1>

<p align="center">
  The source of <a href="https://lemonfiber.app">lemonfiber.app</a>, the
  project's homepage. A static Astro site that reads its progress figures from
  GitHub when it is built.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-building-F0C419?labelColor=17160F">
  <img alt="Astro" src="https://img.shields.io/badge/built%20with-Astro-E07A17?labelColor=17160F">
  <img alt="Licence" src="https://img.shields.io/badge/licence-Hippocratic%203.0-17160F">
  <a href="https://scorecard.dev/viewer/?uri=github.com/lemonfiber/website-lemonfiber.app"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/lemonfiber/website-lemonfiber.app/badge"></a>
</p>

---

## What it shows

[lemonfiber.app](https://lemonfiber.app) explains what lemonfiber is and shows
how far it has got. The figures on it are not typed by hand: each build reads
them from GitHub.

- **The organisation's repositories**: `src/data/seed.ts` lists every public
  repository with the role it plays, and the build adds each one's description,
  language, stars, open issues and last push from GitHub.
- **Releases and good first issues**, from GitHub.
- **What is built**: `lemonfiber/IMPLEMENTATION-STATUS.md`, read per
  deliverable.
- **The specification's size**: how many features and requirements its
  generated feature board holds.

A push to any of those repositories triggers a rebuild. If GitHub cannot be
reached, the build uses the committed snapshot in `src/data/seed.ts`,
`seed-milestones.ts` and `seed-releases.ts`, so it never fails for that reason.

User documentation is not here. Installing, the FAQ, the specification, the
roadmap and the changelog are on
[docs.lemonfiber.app](https://docs.lemonfiber.app), built from
[`website-docs.lemonfiber.app`](https://github.com/lemonfiber/website-docs.lemonfiber.app).
This site links there rather than keeping a second copy.

## Pages

| Route           | What it shows                                                           |
| --------------- | ----------------------------------------------------------------------- |
| `/`             | The pitch, a live status strip, the forms switcher, the twenty services |
| `/transparency` | Every repo, release and open issue — read live from GitHub              |
| `/contribute`   | Ways to help + live good-first-issues                                   |
| `/404`          | The one that says where everything else went                            |

## Develop

```console
$ npm ci          # or: just install
$ npm run dev     # local dev at http://localhost:4321
$ npm run build   # production build (fetches live org data)
$ npm run links   # every internal link in dist/ resolves to a built route
$ just ci         # format, types, lint, typos, a real build and its links
```

Node — the version in `.nvmrc`, which is what CI installs. `GITHUB_TOKEN` is
optional locally (raises the API rate limit).

`just ci` is everything the `build` job reads, plus the spelling check `hygiene`
reads. It is not the whole of CI and the `justfile` says what it leaves out: the
four commit rules, which the hook answers before the push, and the forge-side
jobs, which no clone can run.

`npm ci` also turns on the repository's git hooks.

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

Every change cites a requirement in the
[specification](https://github.com/lemonfiber/spec). Read the
[contributing guide](https://github.com/lemonfiber/spec/blob/main/50-governance/contributing.md)
and [AGENTS.md](AGENTS.md) before your first pull request. Report a
vulnerability privately, as
[SECURITY.md](https://github.com/lemonfiber/.github/blob/main/SECURITY.md)
describes.

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
