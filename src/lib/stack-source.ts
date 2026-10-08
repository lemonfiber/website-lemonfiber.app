// The stack manifest's text, read once at build time for `holdTo`. A manifest
// that cannot be read fails the build: the count the site states is only as
// good as the list it was compared with.

import { readFile } from "node:fs/promises";
import { STACK_URL } from "./stack";

const TIMEOUT_MS = 30_000;

let loaded: Promise<string> | undefined;

/** The manifest, from STACK_MANIFEST (a URL or a path) or the stack's main. */
export function readStack(
  source: string = process.env.STACK_MANIFEST || STACK_URL,
): Promise<string> {
  loaded ??= /^https?:\/\//.test(source)
    ? fetch(source, { signal: AbortSignal.timeout(TIMEOUT_MS) }).then(
        (answer) => {
          if (!answer.ok)
            throw new Error(`${source} answered ${answer.status}`);
          return answer.text();
        },
      )
    : readFile(source, "utf8");
  return loaded;
}
