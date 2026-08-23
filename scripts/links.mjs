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

async function pages(directory, found = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await pages(path, found);
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
}

const exists = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

/** Whether the build produced something at a route a page asks for. */
async function resolves(route) {
  const path = decodeURIComponent(route.replace(/[#?].*$/, ""));
  if (path === "/") return exists(join(DIST, "index.html"));
  const target = join(DIST, path);
  return (
    (await exists(target)) ||
    (await exists(join(target, "index.html"))) ||
    (await exists(`${target}.html`))
  );
}

const html = await pages(DIST);
const broken = [];
const checked = new Map();

for (const page of html) {
  const source = await readFile(page, "utf8");
  for (const [, route] of source.matchAll(ATTRIBUTE)) {
    if (route.startsWith("//")) continue;
    if (!checked.has(route)) checked.set(route, await resolves(route));
    if (!checked.get(route))
      broken.push(`${page.slice(DIST.length) || "/"} -> ${route}`);
  }
}

if (broken.length > 0) {
  console.error(`links: ${broken.length} internal link(s) resolve to nothing\n`);
  for (const one of [...new Set(broken)].sort()) console.error(`  ${one}`);
  process.exit(1);
}
console.log(
  `links: clean (${html.length} page(s), ${checked.size} internal link(s))`,
);
