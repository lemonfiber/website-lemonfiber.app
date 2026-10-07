// The specification's own scale and its version train, read out of its
// generated feature board. The board is written by the spec repo's generator
// and checked by its CI, so the numbers on this site are the ones the
// specification counts about itself rather than a figure somebody typed and
// nobody re-counted.
//
// Same rule as github.ts — a failed fetch never breaks the build. The train
// falls back to the committed snapshot; the counts fall back to nothing.

import { getJSON } from "./github";
import { parseTrain, progressOf, type TrainProgress } from "./train";
import { seedTrain } from "../data/seed-train";

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

/** How far the version train has got, and whether that was read live. */
export interface SpecTrain extends TrainProgress {
  /** False when the board was unreachable and the snapshot stood in. */
  live: boolean;
}

interface Board {
  counts?: SpecCounts;
  versions?: unknown;
}

let board: Promise<Board | null> | undefined;

function readBoard(): Promise<Board | null> {
  board ??= getJSON<Board>(BOARD);
  return board;
}

export async function specCounts(): Promise<SpecCounts | null> {
  return (await readBoard())?.counts ?? null;
}

export async function specTrain(): Promise<SpecTrain> {
  const live = parseTrain(await readBoard());
  return { ...progressOf(live ?? seedTrain), live: live !== null };
}
