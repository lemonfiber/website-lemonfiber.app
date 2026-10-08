// The checkout of `spec` this site renders, at the commit the board snapshot
// read, and the content loader that renders it through the kit.
//
// Each step here hands the network, git or the filesystem a single call; what
// to render and how is `spec-pages.ts` and the kit's `mirror`.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Loader } from "astro/loaders";
import {
  crossRoutes,
  entriesOf,
  readingOf,
} from "@lemonfiber/website-kit/mirror-loader";
import { loadBoard } from "./board";
import { SPEC_MIRROR } from "./spec-pages";

/** Named by its absolute path, as the kit names it, so the build runs the
 *  system's git and not whichever one `PATH` offers. */
const GIT = "/usr/bin/git";

function git(directory: string, ...args: string[]): string {
  return execFileSync(GIT, ["-C", directory, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function head(directory: string): string | null {
  try {
    return git(directory, "rev-parse", "HEAD");
  } catch {
    return null;
  }
}

/** `spec` at one commit under `root/vendor/spec`, fetched alone and shallow,
 *  and the link at `root/src/content/docs/spec` the kit reads it through. */
export function checkoutSpec(root: string, sha: string): void {
  const checkout = join(root, "vendor", SPEC_MIRROR.repo);
  mkdirSync(checkout, { recursive: true });
  if (!existsSync(join(checkout, ".git"))) git(checkout, "init", "-q");
  if (head(checkout) !== sha) {
    git(
      checkout,
      "fetch",
      "-q",
      "--depth",
      "1",
      `${SPEC_MIRROR.remote}.git`,
      sha,
    );
    git(checkout, "checkout", "-q", "--detach", "FETCH_HEAD");
  }
  const link = join(root, "src", "content", "docs", SPEC_MIRROR.route);
  mkdirSync(dirname(link), { recursive: true });
  if (!existsSync(link)) symlinkSync(relative(dirname(link), checkout), link);
}

/** Every page of the specification, at the commit the board snapshot read. A
 *  snapshot that names no commit of `spec` fails the build, as an unreadable
 *  snapshot does (REPO-R40). */
export function specLoader(root: string): Loader {
  return {
    name: "lemonfiber-spec-loader",
    load: async (context) => {
      const sha = (await loadBoard()).sources.spec;
      if (!sha) throw new Error("the board snapshot names no commit of spec");
      checkoutSpec(root, sha);
      const reading = readingOf(SPEC_MIRROR, root);
      const entries = await entriesOf(
        context,
        reading,
        root,
        crossRoutes([reading]),
      );
      context.store.clear();
      for (const entry of entries) context.store.set(entry);
    },
  };
}
