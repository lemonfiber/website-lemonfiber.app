// The version train, as the specification's generated feature board lists it.
//
// `10-functional/features/index.json` carries one row per version manifest:
// its number, its lifecycle status, the roadmap milestone it serves and how
// many goals it locks. The board is written by the spec's own generator and
// checked by its CI, so how far the train has got is read from the files that
// decide it rather than counted here.
//
// Pure functions over the parsed JSON. Fetching it is `spec.ts`.

/** One version of the train, as the board lists it. */
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toVersion(row: unknown): TrainVersion | null {
  if (!isRecord(row)) return null;
  const { version, status, milestone, goals } = row;
  if (
    typeof version !== "string" ||
    typeof status !== "string" ||
    (typeof milestone !== "string" && milestone !== null) ||
    typeof goals !== "number" ||
    !Number.isInteger(goals) ||
    goals < 0
  ) {
    return null;
  }
  return { version, status, milestone, goals };
}

/**
 * The board's `versions` list, or null where the board does not carry one in
 * the shape this site reads.
 *
 * All or nothing: a list with one row this site cannot read is refused whole,
 * because a train missing a version would count progress against the wrong
 * total and say so with confidence.
 */
export function parseTrain(board: unknown): TrainVersion[] | null {
  if (!isRecord(board) || !Array.isArray(board.versions)) return null;
  const rows: unknown[] = board.versions;
  const train = rows.map(toVersion);
  if (train.length === 0) return null;
  const read = train.filter((v): v is TrainVersion => v !== null);
  return read.length === train.length ? read : null;
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
