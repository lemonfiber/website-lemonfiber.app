// The committed release snapshot.
//
// The site names the newest version in three places — the front page's version
// cell, a repository card's latest tag, and the transparency page's recent
// list. All three read the live Releases API; when GitHub is unreachable at
// build time they fall back to this rather than showing nothing, because a site
// that names no release reads as "this project has never shipped".
//
// Every field here is copied from the real release on GitHub — repo, tag, date
// and prerelease flag. Nothing in this file is written by hand, because a
// fallback that invents a plausible release is exactly the failure this site
// exists to avoid. When a new release ships, replace this with that one.
//
// What each release contained is documented, from the specification's own
// version manifests, at docs.lemonfiber.app/project/changelog/.

import type { Release } from "../lib/types";

export const seedReleases: Release[] = [
  {
    repo: "lemonfiber",
    tag: "v0.8.0",
    name: "v0.8.0",
    url: "https://github.com/lemonfiber/lemonfiber/releases/tag/v0.8.0",
    publishedAt: "2026-08-22T13:44:21Z",
    prerelease: true,
  },
];
