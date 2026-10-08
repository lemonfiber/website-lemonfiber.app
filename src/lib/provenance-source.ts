// The provenance each site publishes, read once at build time for the pages
// `/contribute/fix-a-doc/` lists without script. A site that cannot be read is
// listed as unread rather than failing the build: the page is an assist, and the
// facts it lists are the site's, not the snapshot's.

import { provenanceUrl, SITES } from "./fix-a-doc";

/** Each site's provenance, or null where it could not be read. */
export async function readProvenance(): Promise<Record<string, unknown>> {
  const read = async (site: string): Promise<unknown> => {
    try {
      const answer = await fetch(provenanceUrl(site), {
        headers: { Accept: "application/json" },
      });
      return answer.ok ? await answer.json() : null;
    } catch {
      return null;
    }
  };
  const tables = await Promise.all(SITES.map(read));
  return Object.fromEntries(SITES.map((site, at) => [site, tables[at]]));
}
