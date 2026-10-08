// The services the stack runs, as lemonfiber-media-stack's manifest names them:
// `stack.toml` lists a file per service, `services/<id>.toml`, in its
// `include`, and that list alone decides what the stack holds (ARCH-R171). The
// site's own list is held to it, so a service added to the stack or taken out
// of it fails the build until the site says so too.

/** Where the stack manifest is read from, unless STACK_MANIFEST names a copy. */
export const STACK_URL =
  "https://raw.githubusercontent.com/lemonfiber/lemonfiber-media-stack/main/stack.toml";

const INCLUDE = /^include\s*=\s*\[([^\]]*)\]/m;
const ENTRY = /"services\/([a-z0-9][a-z0-9-]*)\.toml"/g;

/** The service ids a root manifest's `include` names, in order. */
export function included(manifest: string): string[] {
  const list = INCLUDE.exec(manifest)?.[1];
  if (list === undefined)
    throw new Error("the stack manifest names no include list");
  const ids = [...list.matchAll(ENTRY)].flatMap((entry) => entry.slice(1, 2));
  if (ids.length === 0)
    throw new Error("the stack manifest includes no service");
  return ids;
}

/** Every way the site's ids and the stack's differ, said in one line each. */
export function drift(stack: string[], site: string[]): string[] {
  const held = new Set(site);
  const run = new Set(stack);
  return [
    ...stack
      .filter((id) => !held.has(id))
      .map((id) => `the stack runs ${id} and the site does not list it`),
    ...site
      .filter((id) => !run.has(id))
      .map((id) => `the site lists ${id} and the stack does not run it`),
  ];
}

/** The site's ids against the manifest's text; a build that differs fails. */
export function holdTo(manifest: string, site: string[]): void {
  const said = drift(included(manifest), site);
  if (said.length > 0) {
    throw new Error(
      `src/data/site.ts services differ from the stack: ${said.join("; ")}`,
    );
  }
}
