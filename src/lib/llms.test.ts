import { describe, expect, it } from "vitest";
import { llmsText, newestTag } from "./llms";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const prose = {
  intro: "# Intro",
  docs: [{ url: "https://d/", title: "Docs", note: "read them." }],
  precisely: "## Precisely",
  installing: (tag: string) => `## Installing ${tag}`,
  status: "## Status",
  aboutSite: (at: string) => `## About, read at ${at}`,
};
const pages = [
  { path: "/roadmap/", title: "Roadmap", description: "Versions." },
];

describe("llmsText", () => {
  it("indexes the pages, the repositories and the release to install", () => {
    const text = llmsText(board, pages, prose);
    expect(text).toContain("- [Docs](https://d/): read them.");
    expect(text).toContain(
      "- [Roadmap](https://lemonfiber.app/roadmap/): Versions.",
    );
    expect(text).toContain(
      "- [lemonfiber/spec](https://lemonfiber.app/repos/spec/)\n",
    );
    expect(text).toContain("## Installing v0.1.0");
    expect(text).toContain("## About, read at 2026-10-08T00:00:00Z");
    expect(text.endsWith("\n")).toBe(true);
  });

  it("names a repository's language, and leaves installing out with no release", () => {
    const text = llmsText(
      {
        ...board,
        releases: [],
        repos: [
          {
            name: "spec",
            group: "root",
            lang: "Markdown",
            note: null,
            pages: [],
            open_pulls: null,
            counted_pulls: null,
            over_cap: null,
            tracker: null,
          },
        ],
      },
      pages,
      prose,
    );
    expect(text).toContain(
      "- [lemonfiber/spec](https://lemonfiber.app/repos/spec/) — Markdown",
    );
    expect(text).not.toContain("## Installing");
  });
});

describe("newestTag", () => {
  it("is the newest release's tag, or null", () => {
    expect(newestTag(board)).toBe("v0.1.0");
    expect(newestTag({ releases: [] })).toBeNull();
  });
});
