import { describe, expect, it } from "vitest";
import {
  evidenceUrl,
  featureState,
  plainText,
  requirementPage,
  requirementsOf,
} from "./feature-page";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const lemonfiber = "b".repeat(40);

describe("plainText", () => {
  it("drops Markdown's link, emphasis and code syntax", () => {
    expect(
      plainText(
        "*Superseded by [DES-R28](surface-mapping.md): the **two** `themes`.* ",
      ),
    ).toBe("Superseded by DES-R28: the two themes.");
    expect(plainText("x*y stays")).toBe("x*y stays");
    expect(plainText("[a](b) and [c](d), [unclosed")).toBe(
      "a and c, [unclosed",
    );
    expect(plainText("a [b] c [d](e)")).toBe("a [b] c d");
    expect(plainText("[a](unclosed")).toBe("[a](unclosed");
  });
});

describe("evidenceUrl", () => {
  it("links a path in the repository at the revision read", () => {
    expect(evidenceUrl(board, "lemonfiber", "src/a.rs")).toEqual({
      text: "src/a.rs",
      url: `https://github.com/lemonfiber/lemonfiber/blob/${lemonfiber}/src/a.rs`,
    });
  });

  it("drops the test name after ::, and follows repo:path to its repository", () => {
    expect(evidenceUrl(board, "lemonfiber", "src/t.rs::a_test").url).toBe(
      `https://github.com/lemonfiber/lemonfiber/blob/${lemonfiber}/src/t.rs`,
    );
    expect(evidenceUrl(board, "lemonfiber", "sdk-ts:src/x.ts").url).toBe(
      "https://github.com/lemonfiber/sdk-ts/blob/main/src/x.ts",
    );
  });
});

describe("requirementsOf", () => {
  it("is a feature's requirements in number order", () => {
    const shuffled = {
      requirements: [...board.requirements].reverse(),
    };
    expect(requirementsOf(shuffled, "A1").map((r) => r.id)).toEqual([
      "A1-R1",
      "A1-R2",
    ]);
  });
});

describe("featureState", () => {
  it("names the versions locking each requirement with the verdict in each", () => {
    const [r1, r2] = featureState(board, "A1");
    expect(r1?.locked).toEqual([
      { version: "0.1.0", status: "released", verdict: "met" },
      { version: "0.2.0", status: "releasable", verdict: "met" },
      { version: "0.3.0", status: "planned", verdict: "unknown" },
    ]);
    expect(r2?.locked).toEqual([]);
  });

  it("names each repository's record with its evidence linked", () => {
    const [r1] = featureState(board, "A1");
    expect(r1?.recorded).toEqual([
      {
        repo: "lemonfiber",
        state: "done",
        evidence: [
          {
            text: "src/a.rs",
            url: `https://github.com/lemonfiber/lemonfiber/blob/${lemonfiber}/src/a.rs`,
          },
        ],
        landed: null,
      },
    ]);
  });

  it("gathers the citations once and the pull requests claiming it", () => {
    const cited = {
      ...board,
      versions: board.versions.map((v) => ({
        ...v,
        goals: v.goals.map((g) =>
          g.id === "B1-R1" ? { ...g, cited_in: ["lemonfiber@abc"] } : g,
        ),
      })),
      pulls: board.pulls.slice(0, 1).map((p) => ({ ...p, cites: ["B1-R1"] })),
    };
    const [b1] = featureState(cited, "B1");
    expect(b1?.citedIn).toEqual(["lemonfiber@abc"]);
    expect(b1?.claims.map((p) => p.number)).toEqual([7]);
  });
});

describe("requirementPage", () => {
  it("is its feature's page, anchored, or null outside every feature", () => {
    expect(requirementPage(board, "A1-R2")).toBe("/features/A1/#A1-R2");
    expect(requirementPage(board, "GOV-R2")).toBeNull();
  });
});
