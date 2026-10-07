import { describe, expect, it } from "vitest";
import { IN_FLIGHT, RELEASED, progressOf, trainOf } from "./train";
import { fixtureBoard } from "../test/board.fixture";

const row = (version: string, status: string, goals: number) => ({
  version,
  status,
  milestone: "M1",
  goals,
});

describe("trainOf", () => {
  it("is every version of the snapshot, in its order, with its goals counted", () => {
    expect(trainOf(fixtureBoard())).toEqual([
      { version: "0.1.0", status: "released", milestone: "M1", goals: 1 },
      { version: "0.2.0", status: "releasable", milestone: null, goals: 2 },
      { version: "0.3.0", status: "planned", milestone: "M2", goals: 3 },
    ]);
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
