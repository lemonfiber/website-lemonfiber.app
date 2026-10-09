# AGENTS.md — website-lemonfiber.app

> **Start at the roadmap and board on [lemonfiber.app](https://lemonfiber.app),
> rendered from the report of where every unreleased version stands. Then the
> rules** every repository shares:
> [working in the repositories](https://github.com/lemonfiber/spec/blob/main/50-governance/working-in-the-repositories.md)
> and [the rules for agents](https://github.com/lemonfiber/spec/blob/main/50-governance/ai-contributors.md).
> This file holds only what is true of this repository.

## What this repo is

The public frontpage at the root of the org — a static site built with
[Astro](https://astro.build). Its defining property: **progress and repo state
are not written here.** They are read at build time from the board snapshot the
specification publishes (every version on the train with the verdict on each
goal, the catalogue, the trackers, the open pull requests) and from the GitHub
API. A maintainer never edits this site to release a version; they push to the
repo that owns the fact, and the site rebuilds. Spec:
[`30-repos/website-lemonfiber.md`](https://github.com/lemonfiber/spec/blob/main/30-repos/website-lemonfiber.md).

Documentation is not here. The install guide, the FAQ, the colophon, the
specification, the roadmap and the changelog are all published by
[`website-docs.lemonfiber.app`](https://github.com/lemonfiber/website-docs.lemonfiber.app),
which renders pinned revisions rather than live ones. A page a reader would
follow as instructions belongs there, and this site links to it.

## Layout

```
src/
├── lib/github.ts     the motor — build-time fetch from the GitHub API, with fallback
├── lib/board.ts      reads the board snapshot, refusing a format it does not know
├── lib/spec.ts       the specification's scale, counted from the snapshot
├── lib/train.ts      what the version train adds up to
├── lib/format.ts     shared formatting helpers
├── lib/types.ts      shapes everything derives from
├── data/site.ts      editorial content; the service/profile/form model
├── data/seed*.ts     offline fallback snapshots — org, releases
├── i18n/             the site's copy — chrome, front page, content pages
├── components/       Nav, Footer, Console, FormsSwitcher, RepoCard, …
├── layouts/Base.astro
├── pages/            index · transparency · contribute · 404
└── styles/tokens.css brand's tokens, named and mapped to roles
public/brand/         logo + mark, copied from the brand repo
```

## The rules you cannot break

- **No hand-authored roadmap or status.** If a fact lives in a repo (a version's
  status, a release, an open issue, how many requirements the spec has),
  read it — never transcribe it here. A fact the board snapshot holds is read
  from it through `src/lib/board.ts`; anything else, through `src/lib/github.ts`.
  Never a new constant.
- **The snapshot fails the build; the GitHub API falls back.** A snapshot that
  cannot be read, or is in an unknown format, fails the build so the published
  site stays as it was, and no committed copy of it may stand in. A GitHub API
  read for something the snapshot does not hold falls back to `src/data/seed.ts`.
- **Tokens come from `brand`.** `@lemonfiber/brand/tokens.css`, pinned by
  commit, declares every colour, face, size, space and radius;
  `src/styles/tokens.css` names them for the components and maps them to roles,
  and declares no value brand has. The faces are served from
  `@lemonfiber/website-kit`. Don't invent a colour here; add it to brand.
- **Nothing renders in `lib`.** The motor returns data; components render it.
- **Self-hosted assets only.** No external fonts, scripts or trackers at runtime
  — privacy is a promise the site itself must keep.

## Checks

```
just check     # astro type-check across .astro / .ts
just test      # the unit tests
just coverage  # the unit tests, with src/lib held at 100%
just build     # the real build — fetches live org data
just links     # every internal link in dist/ resolves to a built route
just ci        # format + check + lint + test + typos + build + links
```

`just links` walks the built output rather than the sources, because an `href`
written in a template is invisible to the shared hygiene gate's Markdown link
check. A route retired from `src/pages/` and still linked from another page is
exactly what it exists to catch.

`GITHUB_TOKEN` is optional locally (raises the API rate limit); CI passes the
job token automatically.

## Before you open a PR

- `just ci` is clean.
