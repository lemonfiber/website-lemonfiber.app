// The specification's own scale, read out of its generated feature board. The
// board is written by the spec repo's generator and checked by its CI, so the
// numbers on this site are the ones the specification counts about itself
// rather than a figure somebody typed and nobody re-counted.
//
// Same rule as github.ts — a failed fetch falls back to nothing, never a
// broken build.

import { getJSON } from "./github";

const ORG = "lemonfiber";
const RAW = "https://raw.githubusercontent.com";
const BOARD = `${RAW}/${ORG}/spec/main/10-functional/features/index.json`;

/** What the board states about the size of the specification. */
export interface SpecCounts {
  features: number;
  requirements: number;
  /** The first and last area letter in use, as the spec writes it. */
  areas: string;
}

let cached: SpecCounts | null | undefined;

export async function specCounts(): Promise<SpecCounts | null> {
  if (cached !== undefined) return cached;
  const board = await getJSON<{ counts?: SpecCounts }>(BOARD);
  cached = board?.counts ?? null;
  return cached;
}
