#!/usr/bin/env node
// Every internal link in the built site resolves to something the build
// produced.
//
// The shared hygiene gate runs lychee over the repository's Markdown, which
// never sees an `href` written in an `.astro` template — so a route that was
// retired stayed linked from the 404 page and from the contribute page without
// a single check going red. This walks the output instead: whatever the browser
// would request, this asks the filesystem for.
//
// External links are lychee's job and are left to it. Fragments are checked as
// far as the page they name; an anchor within it is not resolved here.

import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const ATTRIBUTE = /(?:href|src)="(\/[^"]*)"/g;

/**
 * Every `.html` file under a directory, recursively, in the order the listing
 * gives them.
 *
 * The entries are walked side by side and joined in listing order, so what is
 * found does not depend on which walk finished first.
 *
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function pages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return pages(path);
      return entry.name.endsWith(".html") ? [path] : [];
    }),
  );
  return found.flat();
}

/** @type {(path: string) => Promise<boolean>} */
const exists = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

/**
 * Whether the build produced something at a route a page asks for.
 *
 * @param {string} route
 * @returns {Promise<boolean>}
 */
async function resolves(route) {
  const at = route.search(/[#?]/);
  const path = decodeURIComponent(at === -1 ? route : route.slice(0, at));
  if (path === "/") return exists(join(DIST, "index.html"));
  const target = join(DIST, path);
  return (
    (await exists(target)) ||
    (await exists(join(target, "index.html"))) ||
    (await exists(`${target}.html`))
  );
}

const html = await pages(DIST);

// A build that produced no page has no broken link, and a build that produced
// every page and broke none has no broken link either. The two say the same
// sentence, and only the count in it tells them apart — a number nobody reads on
// a green run. So the first is refused before the check that cannot see it.
if (html.length === 0) {
  console.error(`links: no page under ${DIST}, so nothing was checked\n`);
  console.error("  A build that produced nothing passes a link check. Run the");
  console.error("  build before this, and look at what it wrote.");
  process.exit(1);
}

// Every page is read, and every route resolved, side by side: none depends on
// another. A route asked for by several pages is resolved once.
const asked = await Promise.all(
  html.map(async (page) => ({
    page,
    routes: Array.from(
      (await readFile(page, "utf8")).matchAll(ATTRIBUTE),
      ([, route]) => route,
    ).filter((route) => !route.startsWith("//")),
  })),
);

const wanted = [...new Set(asked.flatMap((one) => one.routes))];
const resolved = await Promise.all(wanted.map((route) => resolves(route)));
const unresolved = new Set(wanted.filter((_, at) => !resolved[at]));

const broken = asked.flatMap(({ page, routes }) =>
  routes
    .filter((route) => unresolved.has(route))
    .map((route) => `${page.slice(DIST.length) || "/"} -> ${route}`),
);

if (broken.length > 0) {
  console.error(
    `links: ${broken.length} internal link(s) resolve to nothing\n`,
  );
  const named = [...new Set(broken)].sort((a, b) => a.localeCompare(b));
  for (const one of named) console.error(`  ${one}`);
  process.exit(1);
}
console.log(
  `links: clean (${html.length} page(s), ${wanted.length} internal link(s))`,
);
