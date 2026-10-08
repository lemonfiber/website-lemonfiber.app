import { describe, expect, it } from "vitest";
import { daysBetween, pullsByRepo } from "./in-flight";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();

describe("daysBetween", () => {
  it("counts whole days, and nothing without a start", () => {
    expect(daysBetween("2026-10-01T00:00:00Z", "2026-10-08T00:00:00Z")).toBe(7);
    expect(daysBetween("2026-10-07T12:00:00Z", "2026-10-08T00:00:00Z")).toBe(0);
    expect(daysBetween(null, "2026-10-08T00:00:00Z")).toBeNull();
  });
});

describe("pullsByRepo", () => {
  it("groups by repository in the map's order, oldest first", () => {
    const groups = pullsByRepo(board);
    expect(groups.map((g) => g.name)).toEqual(["spec", "lemonfiber"]);
    expect(groups[1]?.pulls.map((r) => [r.pull.number, r.age])).toEqual([
      [7, 7],
      [8, 0],
    ]);
    expect(groups[1]?.repo?.counted_pulls).toBe(2);
  });

  it("names the goals each contests with another", () => {
    const [spec, lemonfiber] = pullsByRepo(board);
    expect(lemonfiber?.pulls.map((r) => r.contested)).toEqual([
      ["GOV-R2"],
      ["GOV-R2"],
    ]);
    expect(spec?.pulls[0]?.contested).toEqual([]);
  });

  it("lists a repository the map does not, after those it does", () => {
    const first = board.pulls[0];
    if (!first) throw new Error("the fixture holds a pull request");
    const pull = { ...first, repo: "elsewhere", created_at: null };
    const groups = pullsByRepo({
      ...board,
      pulls: [
        ...board.pulls,
        pull,
        { ...pull, number: 10, created_at: "2026-10-02T00:00:00Z" },
        { ...pull, number: 11 },
        { ...pull, repo: "aside" },
      ],
    });
    expect(groups.map((g) => g.name)).toEqual([
      "spec",
      "lemonfiber",
      "aside",
      "elsewhere",
    ]);
    expect(groups[3]?.repo).toBeNull();
    expect(groups[3]?.pulls.map((r) => [r.pull.number, r.age])).toEqual([
      [7, null],
      [11, null],
      [10, 6],
    ]);
  });
});
