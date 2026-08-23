# AGENTS.md — website-lemonfiber.app

Guidance for any AI agent working in this repo.

> **Common rules for every lemonfiber repo are canonical in the spec:**
> [50-governance/ai-contributors.md](https://github.com/lemonfiber/spec/blob/main/50-governance/ai-contributors.md).
> Read them. This file is the `website-lemonfiber.app`-specific header only.

## What this repo is

The public frontpage at the root of the org — a static site built with
[Astro](https://astro.build). Its defining property: **progress and repo state
are not written here.** They are read from the org at build time — the GitHub
API, the Markdown file the maintainers already keep current
([`lemonfiber/IMPLEMENTATION-STATUS.md`](https://github.com/lemonfiber/lemonfiber/blob/main/IMPLEMENTATION-STATUS.md)),
and the specification's own generated feature board. A maintainer never edits
this site to update a milestone; they push to the repo that owns the fact, and
CI rebuilds. Spec:
[`30-repos/website-lemonfiber.md`](https://github.com/lemonfiber/spec/blob/main/30-repos/website-lemonfiber.md).

Documentation is not here. The install guide, the FAQ, the colophon, the
specification, the roadmap and the changelog are all published by
[`website-docs.lemonfiber.app`](https://github.com/lemonfiber/website-docs.lemonfiber.app),
which renders pinned revisions rather than live ones. A page a reader would
follow as instructions belongs there, and this site links to it.

## Layout

```
src/
├── lib/github.ts     the motor — build-time fetch + Markdown parse, with fallback
├── lib/spec.ts       the specification's own scale, from its generated board
├── lib/format.ts     shared formatting helpers
├── lib/types.ts      shapes everything derives from
├── data/site.ts      editorial content; the service/profile/form model
├── data/seed*.ts     offline fallback snapshots — org, milestones, releases
├── i18n/             the site's copy — chrome, front page, content pages
├── components/       Nav, Footer, Console, FormsSwitcher, RepoCard, …
├── layouts/Base.astro
├── pages/            index · transparency · contribute · 404
└── styles/tokens.css design tokens mirrored from lemonfiber/brand
public/brand/         logo + mark, copied from the brand repo
```

## The rules you cannot break

- **No hand-authored roadmap or status.** If a fact lives in a repo (a milestone,
  a deliverable, a release, an open issue, how many requirements the spec has),
  read it — never transcribe it here. New dynamic data means a new getter in
  `src/lib/github.ts`, not a new constant.
- **Every fetch falls back.** A failed or offline build must still produce a
  correct page from `src/data/seed.ts`. Never let a network call throw into a page.
- **Tokens come from `brand`.** Colours, spacing and the type scale mirror
  `lemonfiber/brand`. The faces do not yet: brand's tokens name Golos Text for
  body and DM Mono for mono, and this site still sets Bricolage and JetBrains
  Mono. Don't invent a colour here; add it there and mirror it.
- **Nothing renders in `lib`.** The motor returns data; components render it.
- **Self-hosted assets only.** No external fonts, scripts or trackers at runtime
  — privacy is a promise the site itself must keep.

## Checks

```
just check     # astro type-check across .astro / .ts
just build     # the real build — fetches live org data
just links     # every internal link in dist/ resolves to a built route
just ci        # check + typos + build + links, what CI runs
```

`just links` walks the built output rather than the sources, because an `href`
written in a template is invisible to the shared hygiene gate's Markdown link
check. A route retired from `src/pages/` and still linked from another page is
exactly what it exists to catch.

`GITHUB_TOKEN` is optional locally (raises the API rate limit); CI passes the
job token automatically.

## Before you open a PR

- `just ci` is clean.
- Cite a spec identifier in a commit `Spec:` trailer and the PR body.
- No AI attribution in commits.
