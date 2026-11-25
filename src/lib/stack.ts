// The services the stack runs, as the bundle in lemonfiber-plugins pins them:
// one `[[plugin]]` table per service, its `id` first, and that list alone
// decides what the stack holds (REPO-R91). A plugin the bundle only offers is
// not one. The site's own list is held to it, so a service added to the stack
// or taken out of it fails the build until the site says so too.

/** Where the bundle is read from, unless STACK_BUNDLE names a copy. */
export const STACK_URL =
  "https://raw.githubusercontent.com/lemonfiber/lemonfiber-plugins/main/bundle/bundle.toml";

const TABLE = /^(?=\[\[)/m;
const PIN = "[[plugin]]";
const ID = /^id\s*=\s*"([a-z0-9][a-z0-9-]*)"/m;

/** The plugin ids the bundle pins, in order. */
export function pinned(bundle: string): string[] {
  const ids = bundle
    .split(TABLE)
    .filter((table) => table.startsWith(`${PIN}\n`))
    .flatMap((table) => ID.exec(table)?.slice(1, 2) ?? []);
  if (ids.length === 0) throw new Error("the bundle pins no plugin");
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

/** The site's ids against the bundle's text; a build that differs fails. */
export function holdTo(bundle: string, site: string[]): void {
  const said = drift(pinned(bundle), site);
  if (said.length > 0) {
    throw new Error(
      `src/data/site.ts services differ from the stack: ${said.join("; ")}`,
    );
  }
}
