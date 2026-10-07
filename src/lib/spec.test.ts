import { describe, expect, it } from "vitest";
import { specCounts } from "./spec";
import { fixtureBoard } from "../test/board.fixture";

describe("specCounts", () => {
  it("counts features, the requirements still held, and the areas they span", () => {
    expect(specCounts(fixtureBoard())).toEqual({
      features: 2,
      requirements: 2,
      areas: "A–B",
    });
  });

  it("names no span for a catalogue with no areas", () => {
    expect(
      specCounts({ features: [], requirements: [], areas: [] }).areas,
    ).toBe("");
  });
});
