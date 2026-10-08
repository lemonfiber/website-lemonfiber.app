import { describe, expect, it } from "vitest";
import {
  FILTER_KEYS,
  MATURITIES,
  columns,
  facetValues,
  featureCards,
  featureOf,
  filterQuery,
  matches,
  parseFilters,
  type FeatureCard,
} from "./features";
import { featureSources } from "./roadmap";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const cards = featureCards(board);
const [a1, b1] = cards as [FeatureCard, FeatureCard];

describe("featureCards", () => {
  it("is one card per feature, in the catalogue's order", () => {
    expect(cards.map((c) => c.id)).toEqual(["A1", "B1"]);
    expect(a1).toMatchObject({
      title: "First run",
      area: "A",
      audience: "operator",
      maturity: "shipped",
      status: "accepted",
      versions: ["0.1.0"],
    });
  });

  it("counts the goals not met in versions not yet released", () => {
    expect(a1.openGoals).toBe(1);
    expect(b1.openGoals).toBe(1);
    expect(featureCards({ ...board, versions: [] })[0]?.openGoals).toBe(0);
  });

  it("names the repositories that record or claim its requirements", () => {
    expect(a1.repos).toEqual(["lemonfiber"]);
    expect(b1.repos).toEqual([]);
    expect(a1.claims).toBe(0);
  });

  it("lists the repositories in name order", () => {
    const two = featureCards({
      ...board,
      trackers: [
        {
          repo: "sdk-ts",
          present: true,
          rows: [
            {
              id: "A1-R1",
              state: "done",
              evidence: [],
              landed: null,
              path: "status.toml",
            },
          ],
        },
        ...board.trackers,
      ],
    });
    expect(two[0]?.repos).toEqual(["lemonfiber", "sdk-ts"]);
  });

  it("counts the pull requests citing its requirements, each once", () => {
    const pull = board.pulls[0];
    const claimed = featureCards({
      ...board,
      pulls: pull ? [{ ...pull, cites: ["B1-R1", "B1-R2"] }] : [],
    });
    expect(claimed[1]?.claims).toBe(1);
    expect(claimed[1]?.repos).toEqual(["lemonfiber"]);
  });
});

describe("featureOf", () => {
  it("reads the feature off a requirement's identifier", () => {
    expect(featureOf("F8-R6")).toBe("F8");
    expect(featureOf("GOV-R1")).toBe("GOV");
    expect(featureOf("README")).toBe("README");
  });
});

describe("filters in the address", () => {
  it("reads the known filters, dropping empty and unknown ones", () => {
    expect(
      parseFilters(
        new URLSearchParams("area=A&version=&nope=1&q=%20run%20&claimed=yes"),
      ),
    ).toEqual({ area: "A", q: "run", claimed: "yes" });
    expect(parseFilters(new URLSearchParams("claimed=maybe"))).toEqual({});
  });

  it("writes them back in the form's order", () => {
    expect(filterQuery({ q: "x", area: "B" })).toBe("?area=B&q=x");
    expect(filterQuery({})).toBe("");
    expect(FILTER_KEYS[0]).toBe("version");
  });
});

describe("matches", () => {
  it("passes a card every filter set agrees with", () => {
    expect(matches(a1, {})).toBe(true);
    expect(matches(a1, { area: "A", audience: "operator" })).toBe(true);
    expect(matches(a1, { area: "B" })).toBe(false);
    expect(matches(a1, { version: "0.1.0" })).toBe(true);
    expect(matches(b1, { version: "0.1.0" })).toBe(false);
    expect(matches(a1, { repo: "lemonfiber" })).toBe(true);
    expect(matches(b1, { repo: "lemonfiber" })).toBe(false);
    expect(matches(a1, { maturity: "shipped" })).toBe(true);
    expect(matches(a1, { status: "draft" })).toBe(false);
    expect(matches(a1, { claimed: "no" })).toBe(true);
    expect(matches(a1, { claimed: "yes" })).toBe(false);
    expect(matches(a1, { label: "ux" })).toBe(false);
    expect(matches(a1, { audience: "household" })).toBe(false);
  });

  it("searches identifiers whole and titles in part, ignoring case", () => {
    expect(matches(a1, { q: "a1" })).toBe(true);
    expect(matches(a1, { q: "FIRST" })).toBe(true);
    expect(matches(a1, { q: "a" })).toBe(false);
  });
});

describe("the form and the columns", () => {
  it("offers every value a facet takes, sorted", () => {
    expect(facetValues(cards)).toEqual({
      area: ["A", "B"],
      audience: ["operator"],
      maturity: [...MATURITIES],
      status: ["accepted", "draft"],
      version: ["0.1.0"],
      repo: ["lemonfiber"],
      label: [],
    });
  });

  it("puts each card in its maturity's column, every column present", () => {
    expect(
      columns(cards).map((c) => [c.maturity, c.cards.map((x) => x.id)]),
    ).toEqual([
      ["planned", ["B1"]],
      ["building", []],
      ["built", []],
      ["shipped", ["A1"]],
    ]);
  });

  it("links every feature to where spec defines it", () => {
    expect(featureSources(board).A1).toBe(
      `https://github.com/lemonfiber/spec/blob/${"a".repeat(40)}/10-functional/features/a-getting-started/a1-first-run.md`,
    );
  });
});
