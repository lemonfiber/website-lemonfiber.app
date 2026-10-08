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
- **The specification's size and the version train**, from the board snapshot
  the specification publishes at
  `https://github.com/lemonfiber/spec/releases/download/board/board.json`: how
  many features and requirements it holds, and every version on the train with
  its status and the goals it locks.

The specification asks for a rebuild whenever the snapshot changes. If the
snapshot cannot be read, or is in a format this site does not know, the build
fails and the published site stays as it was; `BOARD_SNAPSHOT` names a local
file or another address to build from. If GitHub's API cannot be reached, the
build uses the committed snapshot in `src/data/seed.ts` and `seed-releases.ts`.

User documentation is not here. Installing, the FAQ, the specification, the
roadmap and the changelog are on
[docs.lemonfiber.app](https://docs.lemonfiber.app), built from
[`website-docs.lemonfiber.app`](https://github.com/lemonfiber/website-docs.lemonfiber.app).
This site links there rather than keeping a second copy.

## Pages

| Route           | What it shows                                                               |
| --------------- | --------------------------------------------------------------------------- |
| `/`             | The pitch, a live status strip, the forms switcher, the twenty-two services |
| `/transparency` | Every repo, release and open issue — read live from GitHub                  |
| `/contribute`   | Ways to help + live good-first-issues                                       |
| `/404`          | The one that says where everything else went                                |

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
src/lib/github.ts      the motor — fetch from the GitHub API, with a resilient fallback
src/lib/board.ts       reads the board snapshot, refusing a format it does not know
src/lib/spec.ts        the specification's scale, counted from the snapshot
src/lib/train.ts       what the version train adds up to
src/lib/format.ts      shared formatting; src/lib/types.ts the shared shapes
src/data/site.ts       editorial copy; the service / profile / form model
src/data/seed*.ts      offline snapshots — org, releases
src/i18n/              the site's copy — chrome, front page, content pages
src/layouts/Base.astro the shell every page renders into
src/components/        Nav · Footer · Console · FormsSwitcher · RepoCard · …
src/pages/             index · transparency · contribute · 404
src/styles/tokens.css  design tokens mirrored from lemonfiber/brand
```

## Proving the propose form

`/contribute/propose/` composes a proposal or a gap and opens it on GitHub under
the person's own account. It is proved end to end from an account outside the
organisation, with read access to `spec` only and no git installed. The checklist
below is that proof, and the parameter checks in it are the S51 spike.

**Before.** Sign in to GitHub as the outside account. In a private window, check
that `https://github.com/lemonfiber/spec` shows no _Settings_ tab.

**A proposal.**

1. [ ] Open `https://lemonfiber.app/contribute/propose/`. The form shows _A new or
       changed behaviour_ selected, and the file preview updates as you type.
2. [ ] Fill in area `B`, title `Proof of the propose form`, amends `B1`, a problem,
       one statement using MUST, and a rationale. The _Before it can be opened_ list
       empties and _Open it on GitHub_ appears.
3. [ ] Press _Open it on GitHub_. GitHub says it has created a fork of
       `lemonfiber/spec` for the account, or offers to, and opens the new-file page.
4. [ ] The new-file page shows the path
       `10-functional/proposals/proof-of-the-propose-form.md` and the file exactly as
       the preview showed it.
5. [ ] Commit it to a new branch. GitHub's commit form signs the commit off, as the
       organisation requires on web commits. The commit on the fork shows
       _Verified_, and its message ends with `Signed-off-by:` naming the account.
6. [ ] Open the pull request against `lemonfiber/spec` `main`. Paste the title and
       body the site shows, and replace the sign-off line with the one GitHub added
       to the commit, the same name and address.
7. [ ] On the pull request, the checks run:
   - `squash-message` passes;
   - `integrity` passes, because the file is in the proposal shape;
   - `dco` passes on the commit.
     Then close the pull request, since it was only a proof.

**A gap.**

8. [ ] Open `https://lemonfiber.app/contribute/propose/?kind=gap`. _Something the
       specification does not say_ is selected.
9. [ ] Fill in area, title, amends and what it does not say, then repeat steps 3
       to 7. The file carries `kind: gap` and a _What the specification does not say_
       section.

**Without script.**

10. [ ] With JavaScript off, the page shows the file's path and the template in
        two fields. Edit both and press _Open it on GitHub_. GitHub opens the
        new-file page with both filled in.

**The spike: what GitHub's new-file page honours.** Add each parameter by hand to
the address step 3 opened, and note whether GitHub fills it in.

11. [ ] `message=` fills the commit message.
12. [ ] `description=` fills the extended commit description.
13. [ ] `target_branch=` or `branch=` names the new branch.
14. [ ] The page still opens when the address is over 8,000 characters, for a
        long proposal.

A parameter that works is added to the form, and one that does not is noted
here.

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
