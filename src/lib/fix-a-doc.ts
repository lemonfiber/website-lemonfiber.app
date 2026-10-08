// Fix a doc: where a page on one of the organisation's sites is rendered from,
// so a fix goes to the file rather than to the site.
//
// Each site publishes `provenance.json`, every route it renders against the
// repository, path and revision it came from. These are the pure halves of the
// assist: reading an address, finding its entry, and reading the forge's
// comparison of that revision with `main`. The island fetches; nothing here
// does.

/** The sites that publish their provenance; no other address is read. */
export const SITES = [
  "docs.lemonfiber.app",
  "contribute.lemonfiber.app",
  "lemonfiber.app",
] as const;

/** Where a site publishes its provenance, from its root. */
export const PROVENANCE = "provenance.json";

/** The branch a page is edited on. */
export const BRANCH = "main";

const FORGE = "https://github.com/";
const REPOSITORY = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/;
const REVISION = /^[0-9a-f]{7,40}$/;

/** A page's site and its route, as provenance keys it. */
export interface Located {
  site: string;
  route: string;
}

/** Where one page comes from. */
export interface Source {
  route: string;
  repository: string;
  owner: string;
  name: string;
  path: string;
  revision: string;
}

/** How far a page's revision is behind `main`, and whether its file moved. */
export interface Drift {
  behind: number;
  changed: boolean;
}

/** The page an address names, or null where it is not on one of the sites. */
export function locate(address: string): Located | null {
  const text = address.trim();
  let url: URL;
  try {
    url = new URL(text.includes("://") ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!(SITES as readonly string[]).includes(url.hostname)) return null;
  const route = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  return { site: url.hostname, route };
}

/** The address of a site's provenance. */
export function provenanceUrl(site: string): string {
  return `https://${site}/${PROVENANCE}`;
}

/** The page's entry in its site's provenance, or null where it has none this
 *  reads. */
export function sourceOf(table: unknown, route: string): Source | null {
  if (typeof table !== "object" || table === null) return null;
  const entry = (table as Record<string, unknown>)[route];
  if (typeof entry !== "object" || entry === null) return null;
  const { repository, path, revision } = entry as Record<string, unknown>;
  if (typeof repository !== "string" || typeof path !== "string") return null;
  if (typeof revision !== "string" || !REVISION.test(revision) || !path)
    return null;
  if (!REPOSITORY.test(repository)) return null;
  const [owner, name] = repository.slice(FORGE.length).split("/") as [
    string,
    string,
  ];
  return { route, repository, owner, name, path, revision };
}

/** The forge's comparison of the page's revision with `main`. */
export function compareUrl(source: Source): string {
  return `https://api.github.com/repos/${source.owner}/${source.name}/compare/${source.revision}...${BRANCH}`;
}

/** Where the file is edited. */
export function editUrl(source: Source): string {
  return `${source.repository}/edit/${BRANCH}/${source.path}`;
}

/** The file as the page was rendered from it. */
export function renderedUrl(source: Source): string {
  return `${source.repository}/blob/${source.revision}/${source.path}`;
}

/** What the comparison says about the page, or null where it says nothing
 *  this reads. */
export function driftOf(compared: unknown, source: Source): Drift | null {
  if (typeof compared !== "object" || compared === null) return null;
  const { ahead_by: behind, files } = compared as Record<string, unknown>;
  if (typeof behind !== "number") return null;
  const names = Array.isArray(files)
    ? files.map((file) => (file as { filename?: unknown }).filename)
    : [];
  return { behind, changed: names.includes(source.path) };
}

/** One page of a site's listing, with where its file is edited. */
export interface ListedPage {
  url: string;
  path: string;
  edit: string;
}

/** The pages of one repository a site renders. */
export interface ListedRepository {
  repository: string;
  label: string;
  pages: ListedPage[];
}

/** Every page a site's provenance names, grouped by the repository that owns
 *  it, the repositories and their pages in order; an entry this does not read
 *  is left out, as the island leaves it out. */
export function listing(table: unknown, site: string): ListedRepository[] {
  const routes =
    typeof table === "object" && table !== null ? Object.keys(table) : [];
  const groups = new Map<string, ListedRepository>();
  for (const route of routes.toSorted((a, b) => a.localeCompare(b))) {
    const source = sourceOf(table, route);
    if (!source) continue;
    const group = groups.get(source.repository) ?? {
      repository: source.repository,
      label: `${source.owner}/${source.name}`,
      pages: [],
    };
    group.pages.push({
      url: `https://${site}${route}`,
      path: source.path,
      edit: editUrl(source),
    });
    groups.set(source.repository, group);
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}
