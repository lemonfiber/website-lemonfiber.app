import { describe, expect, it } from "vitest";
import { IN_FLIGHT, RELEASED, parseTrain, progressOf } from "./train";
import { seedTrain } from "../data/seed-train";

const row = (version: string, status: string, goals: number) => ({
  version,
  status,
  milestone: "M1",
  goals,
});

describe("parseTrain", () => {
  it("reads the board's versions in train order", () => {
    const board = {
      counts: { features: 1, requirements: 2, areas: "A–A" },
      versions: [row("0.1.0", "released", 3), row("0.2.0", "planned", 4)],
    };
    expect(parseTrain(board)).toEqual([
      row("0.1.0", "released", 3),
      row("0.2.0", "planned", 4),
    ]);
  });

  it("reads a version that names no milestone", () => {
    const board = {
      versions: [{ ...row("0.1.0", "planned", 1), milestone: null }],
    };
    expect(parseTrain(board)?.[0]?.milestone).toBeNull();
  });

  it("refuses a board that is not an object or carries no versions", () => {
    expect(parseTrain(null)).toBeNull();
    expect(parseTrain([])).toBeNull();
    expect(parseTrain("index")).toBeNull();
    expect(parseTrain({ counts: {} })).toBeNull();
    expect(parseTrain({ versions: {} })).toBeNull();
    expect(parseTrain({ versions: [] })).toBeNull();
  });

  it.each([
    ["a row that is not an object", "0.2.0"],
    [
      "a version that is not a string",
      { ...row("x", "planned", 1), version: 2 },
    ],
    [
      "a status that is not a string",
      { ...row("0.2.0", "planned", 1), status: null },
    ],
    [
      "a milestone that is missing",
      { version: "0.2.0", status: "planned", goals: 1 },
    ],
    [
      "goals that are not a number",
      { ...row("0.2.0", "planned", 1), goals: "1" },
    ],
    ["goals that are not whole", row("0.2.0", "planned", 1.5)],
    ["goals below zero", row("0.2.0", "planned", -1)],
  ])("refuses the whole list for %s", (_why, bad) => {
    expect(
      parseTrain({ versions: [row("0.1.0", "released", 3), bad] }),
    ).toBeNull();
  });
});

describe("progressOf", () => {
  it("counts released versions and the goals they locked", () => {
    const progress = progressOf([
      row("0.1.0", RELEASED, 30),
      row("0.2.0", RELEASED, 10),
      row("0.3.0", "releasable", 20),
      row("0.4.0", "planned", 40),
    ]);
    expect(progress).toMatchObject({
      released: 2,
      versions: 4,
      releasedGoals: 40,
      goals: 100,
      pct: 40,
    });
  });

  it("lists every version between planning and release, in train order", () => {
    const train = [
      row("0.1.0", "released", 1),
      row("0.2.0", "releasable", 1),
      row("0.3.0", "in_progress", 1),
      row("0.4.0", "staged", 1),
      row("0.5.0", "planned", 1),
      row("0.6.0", "yanked", 1),
    ];
    expect(progressOf(train).inFlight.map((v) => v.version)).toEqual([
      "0.2.0",
      "0.3.0",
      "0.4.0",
    ]);
    expect(IN_FLIGHT).not.toContain(RELEASED);
  });

  it("does not count a yanked version as released", () => {
    expect(progressOf([row("0.1.0", "yanked", 5)]).released).toBe(0);
  });

  it("reports nothing released of a train with no goals", () => {
    expect(progressOf([row("0.1.0", "planned", 0)]).pct).toBe(0);
    expect(progressOf([]).pct).toBe(0);
  });

  it("rounds to a whole percent", () => {
    expect(
      progressOf([row("0.1.0", RELEASED, 1), row("0.2.0", "planned", 2)]).pct,
    ).toBe(33);
  });
});

describe("the committed snapshot", () => {
  it("is a train this site can read", () => {
    expect(parseTrain({ versions: seedTrain })).toEqual(seedTrain);
  });
});
