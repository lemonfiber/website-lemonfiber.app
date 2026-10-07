// What the board needs of each feature: where it stands and the facets it is
// filtered by, all read from the snapshot. The same filtering serves the page
// built without script and the island that filters in place, so the two
// cannot disagree about what a filter means.
//
// Pure functions. Components render; nothing here does.

import type { Board, Feature } from "./board";
import { FINISHED } from "./roadmap";

/** The columns of the board, in the order work moves through them. */
export const MATURITIES = ["planned", "building", "built", "shipped"] as const;
export type Maturity = (typeof MATURITIES)[number];

/** One feature as the board shows and filters it. */
export interface FeatureCard {
  id: string;
  title: string;
  area: string;
  audience: string;
  maturity: string;
  status: string;
  labels: string[];
  /** Every version locking one of its requirements. */
  versions: string[];
  /** Repositories whose tracker holds a row for one of its requirements, or
   *  whose open pull request cites one. */
  repos: string[];
  /** Goals of versions not yet released that are not met. */
  openGoals: number;
  /** Open pull requests citing one of its requirements. */
  claims: number;
}

/** The filters the board reads from the address. Each is optional. */
export interface Filters {
  version?: string;
  area?: string;
  audience?: string;
  repo?: string;
  maturity?: string;
  status?: string;
  claimed?: "yes" | "no";
  label?: string;
  q?: string;
}

/** The facets the board is also built as a page for, one per value, so the
 *  filters that matter most work without script. */
export const PAGED_FACETS = ["area", "version", "repo"] as const;
export type PagedFacet = (typeof PAGED_FACETS)[number];

/** The query parameters that are filters, in the order the form shows them. */
export const FILTER_KEYS = [
  "version",
  "area",
  "audience",
  "repo",
  "maturity",
  "status",
  "claimed",
  "label",
  "q",
] as const satisfies readonly (keyof Filters)[];

/** The feature a requirement belongs to, read off its identifier. */
export function featureOf(requirement: string): string {
  const at = requirement.lastIndexOf("-R");
  return at === -1 ? requirement : requirement.slice(0, at);
}

function byFeature<T>(
  items: readonly T[],
  ids: (item: T) => readonly string[],
): Map<string, Set<T>> {
  const found = new Map<string, Set<T>>();
  for (const item of items) {
    for (const id of ids(item)) {
      const feature = featureOf(id);
      const set = found.get(feature) ?? new Set<T>();
      set.add(item);
      found.set(feature, set);
    }
  }
  return found;
}

/** Every feature of the snapshot as a card, in the catalogue's order. */
export function featureCards(
  board: Pick<Board, "features" | "versions" | "pulls" | "trackers">,
): FeatureCard[] {
  const claims = byFeature(board.pulls, (p) => p.cites);
  const rows = new Map<string, Set<string>>();
  for (const tracker of board.trackers) {
    for (const row of tracker.rows) {
      const feature = featureOf(row.id);
      const set = rows.get(feature) ?? new Set<string>();
      set.add(tracker.repo);
      rows.set(feature, set);
    }
  }
  const open = new Map<string, number>();
  for (const version of board.versions) {
    if (FINISHED.includes(version.status)) continue;
    for (const goal of version.goals) {
      if (goal.verdict === "met") continue;
      const feature = featureOf(goal.id);
      open.set(feature, (open.get(feature) ?? 0) + 1);
    }
  }
  return board.features.map((f: Feature) => {
    const pulls = [...(claims.get(f.id) ?? [])];
    const repos = new Set([
      ...(rows.get(f.id) ?? []),
      ...pulls.map((p) => p.repo),
    ]);
    return {
      id: f.id,
      title: f.title,
      area: f.area,
      audience: f.audience,
      maturity: f.maturity,
      status: f.status,
      labels: f.labels,
      versions: f.versions.map((v) => v.version),
      repos: [...repos].sort((a, b) => a.localeCompare(b)),
      openGoals: open.get(f.id) ?? 0,
      claims: pulls.length,
    };
  });
}

/** The filters an address carries, unknown keys and empty values ignored. */
export function parseFilters(params: URLSearchParams): Filters {
  const found: Filters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim();
    if (!value) continue;
    if (key === "claimed") {
      if (value === "yes" || value === "no") found.claimed = value;
    } else {
      found[key] = value;
    }
  }
  return found;
}

/** The address of the board with these filters. */
export function filterQuery(filters: Filters): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Whether a card passes every filter set. */
export function matches(card: FeatureCard, filters: Filters): boolean {
  const q = filters.q?.toLowerCase();
  return (
    (!filters.version || card.versions.includes(filters.version)) &&
    (!filters.area || card.area === filters.area) &&
    (!filters.audience || card.audience === filters.audience) &&
    (!filters.repo || card.repos.includes(filters.repo)) &&
    (!filters.maturity || card.maturity === filters.maturity) &&
    (!filters.status || card.status === filters.status) &&
    (!filters.claimed || card.claims > 0 === (filters.claimed === "yes")) &&
    (!filters.label || card.labels.includes(filters.label)) &&
    (!q || card.id.toLowerCase() === q || card.title.toLowerCase().includes(q))
  );
}

/** The values each facet takes across the cards, sorted, for the form. */
export function facetValues(cards: readonly FeatureCard[]) {
  const sorted = (values: Iterable<string>) =>
    [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  return {
    area: sorted(cards.map((c) => c.area)),
    audience: sorted(cards.map((c) => c.audience)),
    maturity: [...MATURITIES] as string[],
    status: sorted(cards.map((c) => c.status)),
    version: sorted(cards.flatMap((c) => c.versions)),
    repo: sorted(cards.flatMap((c) => c.repos)),
    label: sorted(cards.flatMap((c) => c.labels)),
  };
}

/** The cards in each column, in the board's column order. */
export function columns(
  cards: readonly FeatureCard[],
): { maturity: Maturity; cards: FeatureCard[] }[] {
  return MATURITIES.map((maturity) => ({
    maturity,
    cards: cards.filter((c) => c.maturity === maturity),
  }));
}
