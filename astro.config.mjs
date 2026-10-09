// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import { satteri } from "@astrojs/markdown-satteri";
import { requirementAnchors } from "./src/lib/spec-pages.ts";
import { sitePolicy } from "@lemonfiber/website-kit/csp";
import { scrollableTables } from "@lemonfiber/website-kit/tables";

// The public URL the site is served from.
//
// Custom domain (lemonfiber.app) → `base` stays "/". `.app` is HSTS-preloaded,
// so the host must serve HTTPS, which Cloudflare and GitHub Pages both do.
export default defineConfig({
  site: "https://lemonfiber.app",
  base: "/",
  trailingSlash: "ignore",
  build: {
    // Emit foo/index.html so routes work identically on a static host.
    format: "directory",
  },
  // The specification's pages are Markdown; every requirement row in them is
  // given its identifier as an anchor (REPO-R79).
  markdown: {
    processor: satteri({
      hastPlugins: [requirementAnchors, scrollableTables({ label: "Table" })],
    }),
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [
    // The board's filters are one island, bundled with the site and served
    // from it; every page still renders and reads without script.
    preact(),
    sitemap({
      // The 404 is not a destination, so it does not belong in a sitemap.
      filter: (page) => !page.includes("/404"),
    }),
    // Last, so each page's policy hashes the inline blocks it ships with. The
    // fix-a-doc page asks the two sites it fixes which source each of their
    // pages came from, and the forge how far that source has moved since.
    sitePolicy({
      connect: [
        "https://docs.lemonfiber.app",
        "https://contribute.lemonfiber.app",
        "https://api.github.com",
      ],
    }),
  ],
});
