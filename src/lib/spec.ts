// The specification's own scale, counted from the board snapshot: how many
// features its catalogue holds, how many requirements are in force or in
// draft, and which areas they span.

import type { Board } from "./board";

/** What the snapshot says about the size of the specification. */
export interface SpecCounts {
  features: number;
  requirements: number;
  /** The first and last area letter in use, as the spec writes it. */
  areas: string;
}

/** The statuses of a requirement the specification still holds. */
const HELD = new Set(["accepted", "draft"]);

export function specCounts(
  board: Pick<Board, "features" | "requirements" | "areas">,
): SpecCounts {
  const areas = board.areas.map((a) => a.id).sort((a, b) => a.localeCompare(b));
  const first = areas.at(0);
  const last = areas.at(-1);
  return {
    features: board.features.length,
    requirements: board.requirements.filter((r) => HELD.has(r.status)).length,
    areas: first && last ? `${first}–${last}` : "",
  };
}
