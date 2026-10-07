// The version train, as the board snapshot carries it.
//
// The snapshot holds every version manifest in train order with its lifecycle
// status, the roadmap milestone it serves and each goal it locks. How far the
// train has got is counted from that, never kept here.
//
// Pure functions over the snapshot. Reading it is `board.ts`.

import type { Board } from "./board";

/** One version of the train. */
export interface TrainVersion {
  version: string;
  /** The manifest's lifecycle state, e.g. "staged" or "released". */
  status: string;
  /** The roadmap milestone the version serves, e.g. "M14", where it names one. */
  milestone: string | null;
  /** How many requirements the version locks as goals. */
  goals: number;
}

/** How far the train has got, counted from its versions. */
export interface TrainProgress {
  released: number;
  versions: number;
  /** Goals locked by released versions: the release gate met every one. */
  releasedGoals: number;
  goals: number;
  pct: number;
  /** The versions past planning and not yet released, in train order. */
  inFlight: TrainVersion[];
}

/** The lifecycle state a version reaches when it is published. */
export const RELEASED = "released";

/**
 * The lifecycle states between planning and release: goals frozen,
 * work under way, or every goal met and waiting to be cut.
 */
export const IN_FLIGHT: readonly string[] = [
  "staged",
  "in_progress",
  "releasable",
];

/** Each version of the snapshot as a train row: how many goals it locks. */
export function trainOf(board: Pick<Board, "versions">): TrainVersion[] {
  return board.versions.map((v) => ({
    version: v.version,
    status: v.status,
    milestone: v.milestone,
    goals: v.goals.length,
  }));
}

/** What the train adds up to. */
export function progressOf(train: readonly TrainVersion[]): TrainProgress {
  const released = train.filter((v) => v.status === RELEASED);
  const goals = train.reduce((n, v) => n + v.goals, 0);
  const releasedGoals = released.reduce((n, v) => n + v.goals, 0);
  return {
    released: released.length,
    versions: train.length,
    releasedGoals,
    goals,
    pct: goals === 0 ? 0 : Math.round((releasedGoals / goals) * 100),
    inFlight: train.filter((v) => IN_FLIGHT.includes(v.status)),
  };
}
