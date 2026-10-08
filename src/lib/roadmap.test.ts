import { describe, expect, it } from "vitest";
import {
  BAR_ORDER,
  PAGE_ORDER,
  commitUrl,
  finished,
  goalsByVerdict,
  manifestUrl,
  repoFile,
  repoTree,
  requirementUrl,
  specFile,
  takingWork,
  verdictCounts,
} from "./roadmap";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const [released, releasable, planned] = board.versions as [
  (typeof board.versions)[number],
  (typeof board.versions)[number],
  (typeof board.versions)[number],
];
const spec = "a".repeat(40);

describe("verdicts", () => {
  it("counts every verdict, the absent ones as zero", () => {
    expect(verdictCounts(planned)).toEqual({
      met: 0,
      claimed: 1,
      unmarked: 0,
      uncited: 0,
      unknown: 1,
      open: 1,
    });
  });

  it("groups goals in the order someone can act on them, met last", () => {
    expect(
      goalsByVerdict(planned).map((g) => [g.verdict, g.goals.map((x) => x.id)]),
    ).toEqual([
      ["claimed", ["GOV-R2"]],
      ["unknown", ["A1-R1"]],
      ["open", ["B1-R1"]],
    ]);
    expect(goalsByVerdict(releasable).map((g) => g.verdict)).toEqual(["met"]);
  });

  it("orders the bar and the page over the same six verdicts", () => {
    expect([...BAR_ORDER].sort()).toEqual([...PAGE_ORDER].sort());
    expect(BAR_ORDER).toHaveLength(6);
  });
});

describe("finished", () => {
  it("folds a version that has gone out, released or yanked", () => {
    expect(finished(released)).toBe(true);
    expect(finished({ ...released, status: "yanked" })).toBe(true);
    expect(finished(releasable)).toBe(false);
  });
});

describe("takingWork", () => {
  it("is the first two versions on the train still taking work", () => {
    const more = {
      versions: [
        ...board.versions,
        { ...planned, version: "0.4.0", status: "staged" },
        { ...planned, version: "0.5.0" },
      ],
    };
    expect(takingWork(more).map((v) => v.version)).toEqual(["0.3.0", "0.4.0"]);
    expect(takingWork(board).map((v) => v.version)).toEqual(["0.3.0"]);
  });
});

describe("addresses", () => {
  it("names a file in any repository at the revision read", () => {
    expect(repoFile(board, "lemonfiber", "status/A1.toml")).toBe(
      `https://github.com/lemonfiber/lemonfiber/blob/${"b".repeat(40)}/status/A1.toml`,
    );
    expect(repoFile(board, "brand", "README.md")).toBe(
      "https://github.com/lemonfiber/brand/blob/main/README.md",
    );
    expect(repoTree(board, "brand", "assets")).toBe(
      "https://github.com/lemonfiber/brand/tree/main/assets",
    );
  });

  it("names a file in spec at the revision the snapshot read", () => {
    expect(specFile(board, "x.md")).toBe(
      `https://github.com/lemonfiber/spec/blob/${spec}/x.md`,
    );
    expect(specFile({ sources: {} }, "x.md")).toBe(
      "https://github.com/lemonfiber/spec/blob/main/x.md",
    );
    expect(manifestUrl(board, "0.2.0")).toBe(
      `https://github.com/lemonfiber/spec/blob/${spec}/70-operations/versions/0.2.0.toml`,
    );
  });

  it("finds where a requirement is defined: its feature, or its document", () => {
    expect(requirementUrl(board, "A1-R1")).toBe(
      `https://github.com/lemonfiber/spec/blob/${spec}/10-functional/features/a-getting-started/a1-first-run.md`,
    );
    expect(requirementUrl(board, "GOV-R1")).toBe(
      `https://github.com/lemonfiber/spec/blob/${spec}/GOV`,
    );
    expect(requirementUrl(board, "Z9-R9")).toBeNull();
  });

  it("turns a repo@sha citation into the commit's address", () => {
    expect(commitUrl("lemonfiber@abc1234")).toBe(
      "https://github.com/lemonfiber/lemonfiber/commit/abc1234",
    );
    expect(commitUrl("garbled")).toBe(
      "https://github.com/lemonfiber/garbled/commit/",
    );
  });
});
