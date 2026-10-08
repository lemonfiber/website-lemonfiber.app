import { describe, expect, it } from "vitest";
import { byRepo, pickFacetValues, pickMatches, pickable } from "./pick";
import type { Pickable } from "./pick";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();

describe("pickable", () => {
  it("is each unmet, unclaimed goal of the versions taking work", () => {
    const [planned] = pickable(board);
    expect(planned?.version.version).toBe("0.3.0");
    expect(planned?.goals.map((g) => [g.id, g.verdict])).toEqual([
      ["B1-R1", "open"],
      ["A1-R1", "unknown"],
      ["GOV-R2", "claimed"],
    ]);
  });

  it("leaves out a goal an open pull request claims", () => {
    const claimed = {
      ...board,
      versions: board.versions.map((v) => ({
        ...v,
        goals: v.goals.map((g) =>
          g.id === "GOV-R2"
            ? {
                ...g,
                claims: [
                  { repo: "lemonfiber", number: 7, url: "u", draft: true },
                ],
              }
            : g,
        ),
      })),
    };
    expect(pickable(claimed)[0]?.goals.map((g) => g.id)).toEqual([
      "B1-R1",
      "A1-R1",
    ]);
  });

  it("names its area, its text and the repositories still to record it", () => {
    const tracked = {
      ...board,
      trackers: [
        {
          repo: "sdk-ts",
          present: true,
          rows: [
            {
              id: "B1-R1",
              state: "open" as const,
              evidence: [],
              landed: null,
              path: "status.toml",
            },
          ],
        },
        ...board.trackers,
      ],
    };
    const [b1, a1, gov] = pickable(tracked)[0]?.goals ?? [];
    expect([b1?.repos, b1?.area, b1?.text, b1?.page]).toEqual([
      ["sdk-ts"],
      "B",
      "B1-R1 MUST hold.",
      "/features/B1/#B1-R1",
    ]);
    expect(a1?.repos).toEqual([]);
    expect([gov?.area, gov?.text, gov?.page]).toEqual([null, null, null]);
  });
});

const goal = (id: string, repos: string[], area: string | null): Pickable => ({
  id,
  version: "0.3.0",
  verdict: "open",
  repos,
  area,
  text: null,
  page: null,
});

describe("byRepo", () => {
  it("groups by repository in name order, the untracked last", () => {
    const goals = [
      goal("A1-R1", ["sdk-ts", "lemonfiber"], "A"),
      goal("A1-R2", [], "A"),
      goal("B1-R1", ["lemonfiber"], "B"),
    ];
    expect(
      byRepo(goals).map((g) => [g.repo, g.goals.map((x) => x.id)]),
    ).toEqual([
      ["lemonfiber", ["A1-R1", "B1-R1"]],
      ["sdk-ts", ["A1-R1"]],
      [null, ["A1-R2"]],
    ]);
    expect(byRepo([goal("A1-R1", ["x"], "A")]).map((g) => g.repo)).toEqual([
      "x",
    ]);
  });
});

describe("facets", () => {
  it("matches a goal by version, area or repository", () => {
    const g = goal("A1-R1", ["lemonfiber"], "A");
    expect(pickMatches(g, "repo", "lemonfiber")).toBe(true);
    expect(pickMatches(g, "repo", "spec")).toBe(false);
    expect(pickMatches(g, "area", "A")).toBe(true);
    expect(pickMatches(g, "version", "0.4.0")).toBe(false);
  });

  it("lists each facet's values, sorted, the missing left out", () => {
    const values = pickFacetValues([
      goal("A1-R1", ["sdk-ts", "lemonfiber"], "B"),
      { ...goal("X-R1", [], null), version: "0.10.0" },
      goal("A1-R2", [], "A"),
    ]);
    expect(values).toEqual({
      version: ["0.3.0", "0.10.0"],
      area: ["A", "B"],
      repo: ["lemonfiber", "sdk-ts"],
    });
  });
});
