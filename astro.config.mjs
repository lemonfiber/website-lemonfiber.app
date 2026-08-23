// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The public URL the site is served from.
//
// Custom domain (lemonfiber.app) → `base` stays "/". `.app` is HSTS-preloaded,
// so the host must serve HTTPS (GitHub Pages and Cloudflare Pages both do).
// For a project page (lemonfiber.github.io/website-lemonfiber.app) set
// `base: "/website-lemonfiber.app"`.
export default defineConfig({
  site: "https://lemonfiber.app",
  base: "/",
  trailingSlash: "ignore",
  build: {
    // Emit foo/index.html so routes work identically on a static host.
    format: "directory",
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [
    sitemap({
      // The 404 is not a destination, so it does not belong in a sitemap.
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
