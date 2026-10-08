import { describe, expect, it } from "vitest";
import {
  changelogUrl,
  entryCount,
  gatedOn,
  newestFirst,
  referenceUrl,
} from "./releases";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();

describe("releases", () => {
  it("lists the newest first", () => {
    const [first] = board.releases;
    if (!first) throw new Error("the fixture holds a release");
    const later = { ...first, version: "0.2.0" };
    expect(
      newestFirst({ releases: [...board.releases, later] }).map(
        (r) => r.version,
      ),
    ).toEqual(["0.2.0", "0.1.0"]);
  });

  it("links an entry's pull request, and nothing else", () => {
    expect(referenceUrl("#680")).toBe(
      "https://github.com/lemonfiber/lemonfiber/pull/680",
    );
    expect(referenceUrl("v0.1.0")).toBeNull();
    expect(referenceUrl(null)).toBeNull();
  });

  it("names the changelog file at the revision read", () => {
    expect(changelogUrl(board, "0.1.0")).toBe(
      `https://github.com/lemonfiber/lemonfiber/blob/${"b".repeat(40)}/reference/changelog/0.1.0.json`,
    );
  });

  it("holds the goals the manifest gated it on, or none", () => {
    expect(gatedOn(board, "0.1.0").map((g) => g.id)).toEqual(["A1-R1"]);
    expect(gatedOn(board, "9.9.9")).toEqual([]);
  });

  it("counts entries across groups", () => {
    const [release] = board.releases;
    expect(release && entryCount(release)).toBe(1);
    expect(
      release &&
        entryCount({
          ...release,
          groups: [...release.groups, ...release.groups],
        }),
    ).toBe(2);
  });
});
