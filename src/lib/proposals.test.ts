import { describe, expect, it } from "vitest";
import { FEED_KINDS, feed } from "./proposals";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const SPEC = `https://github.com/lemonfiber/spec/blob/${"a".repeat(40)}`;

describe("feed", () => {
  it("groups the feed by kind, each with its page and source", () => {
    const withRequirements = {
      ...board,
      proposals: [
        ...board.proposals,
        {
          kind: "requirement" as const,
          id: "B1-R1",
          title: "The tool **MUST** read [the file](x.md).",
          url: null,
        },
        { kind: "requirement" as const, id: "Z9-R1", title: "Gone", url: null },
        { kind: "feature" as const, id: "Z9", title: "Unknown", url: null },
      ],
    };
    const [features, requirements, rfcs] = feed(withRequirements);
    expect([features?.kind, requirements?.kind, rfcs?.kind]).toEqual([
      ...FEED_KINDS,
    ]);
    expect(features?.items.map((i) => [i.page, i.source])).toEqual([
      ["/features/B1/", `${SPEC}/10-functional/features/b-running/b1-forms.md`],
      [null, null],
    ]);
    expect(requirements?.items.map((i) => [i.title, i.page, i.source])).toEqual(
      [
        [
          "The tool MUST read the file.",
          "/features/B1/#B1-R1",
          `${SPEC}/10-functional/features/b-running/b1-forms.md`,
        ],
        ["Gone", null, null],
      ],
    );
    expect(
      rfcs?.items.map((i) => [i.label, i.title, i.page, i.source]),
    ).toEqual([["#4", "RFC: a thing", null, "https://x/4"]]);
    expect(features?.items[0]?.label).toBe("B1");
  });
});
