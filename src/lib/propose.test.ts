import { describe, expect, it } from "vitest";
import {
  faults,
  filename,
  newFileUrl,
  proposalText,
  prose,
  pullBody,
  pullTitle,
  slug,
  statementsOf,
  type Asked,
} from "./propose";

const proposal: Asked = {
  kind: "proposal",
  area: "B",
  title: "Scheduled scans",
  amends: "B1",
  problem: "Scans run only by hand.",
  statements: ["The stack MUST scan on a schedule."],
  rationale: "Nobody remembers.",
  missing: "",
};
const gap: Asked = {
  ...proposal,
  kind: "gap",
  title: "Silence on scans",
  statements: [],
  missing: "When scans run.",
};
const AREAS = ["A", "B"];
const FEATURES = ["B1"];

describe("the file", () => {
  it("is a proposal in the template's shape, as lfdev writes it", () => {
    expect(proposalText(proposal)).toBe(
      [
        "---",
        "kind: proposal",
        "area: B",
        "title: Scheduled scans",
        "amends: B1",
        "status: draft",
        "---",
        "",
        "# Scheduled scans",
        "",
        "## Problem",
        "",
        "Scans run only by hand.",
        "",
        "## Proposed behaviour",
        "",
        "- The stack MUST scan on a schedule.",
        "",
        "## Rationale",
        "",
        "Nobody remembers.",
        "",
      ].join("\n"),
    );
  });

  it("says (none given) for an empty problem or rationale, and leaves out amends when empty", () => {
    const text = proposalText({
      ...proposal,
      amends: " ",
      problem: "",
      rationale: "",
    });
    expect(text).not.toContain("amends:");
    expect(text.match(/\(none given\)/g)).toHaveLength(2);
  });

  it("is a gap with what the specification does not say", () => {
    expect(proposalText(gap)).toContain(
      "status: draft\n---\n\n# Silence on scans\n\n## What the specification does not say\n\nWhen scans run.\n",
    );
  });

  it("escapes a line that would open a heading", () => {
    expect(prose("plain\n  # not a heading")).toBe(
      "plain\n\\  # not a heading",
    );
  });

  it("is named from its title", () => {
    expect(slug("  Scans: on a schedule!  ")).toBe("scans-on-a-schedule");
    expect(slug("x".repeat(55) + " yz")).toBe("x".repeat(55));
    expect(slug("--- a -- b ---")).toBe("a-b");
    expect(slug("!!!")).toBe("");
    expect(slug("-".repeat(50000) + "x")).toBe("x");
    expect(filename(proposal)).toBe(
      "10-functional/proposals/scheduled-scans.md",
    );
  });

  it("reads one statement a line, a bullet dropped", () => {
    expect(statementsOf("- One MUST.\n\n* Two MAY.\n Three SHOULD. ")).toEqual([
      "One MUST.",
      "Two MAY.",
      "Three SHOULD.",
    ]);
  });
});

describe("faults", () => {
  it("passes a whole proposal and a whole gap", () => {
    expect(faults(proposal, AREAS, FEATURES)).toEqual([]);
    expect(
      faults(
        { ...gap, amends: "20-architecture/overview.md" },
        AREAS,
        FEATURES,
      ),
    ).toEqual([]);
  });

  it("names each thing missing or wrong", () => {
    expect(
      faults(
        {
          ...proposal,
          area: "Z",
          title: "!!",
          amends: "Q9",
          statements: ["It scans."],
          rationale: "| **B1-R9** | a row |",
        },
        AREAS,
        FEATURES,
      ),
    ).toEqual([
      "Choose the area it belongs to.",
      "Give it a title: one line naming the capability.",
      "What it amends is a feature's identifier, like B3, or a page's path, like 20-architecture/overview.md.",
      "Write at least one statement, and use MUST, SHOULD or MAY in each.",
      "Leave out requirement rows: identifiers are allocated when it is approved.",
    ]);
  });

  it("asks a proposal for a statement and a gap for what is silent", () => {
    expect(faults({ ...proposal, statements: [] }, AREAS, FEATURES)).toEqual([
      "Write at least one statement, and use MUST, SHOULD or MAY in each.",
    ]);
    expect(
      faults({ ...gap, amends: "", missing: " " }, AREAS, FEATURES),
    ).toEqual([
      "Name the feature or page that is silent, and say what it does not say.",
    ]);
    expect(
      faults({ ...proposal, title: "two\nlines" }, AREAS, FEATURES),
    ).toHaveLength(1);
  });
});

describe("on GitHub", () => {
  it("opens the new-file page with the file named and filled in", () => {
    const url = new URL(newFileUrl(proposal));
    expect(url.origin + url.pathname).toBe(
      "https://github.com/lemonfiber/spec/new/main",
    );
    expect(url.searchParams.get("filename")).toBe(filename(proposal));
    expect(url.searchParams.get("value")).toBe(proposalText(proposal));
    expect(newFileUrl(proposal)).not.toContain("+");
  });

  it("titles and ends the pull request as its squash commit needs", () => {
    expect(pullTitle(proposal)).toBe("docs(proposal): Scheduled scans");
    expect(pullTitle(gap)).toBe("docs(gap): Silence on scans");
    expect(pullBody(proposal)).toContain("a change to the specification");
    expect(pullBody(gap)).toContain("a gap in the specification");
    expect(
      pullBody(gap).endsWith(
        "Spec: GOV-R40\n\nSigned-off-by: Your Name <you@example.org>",
      ),
    ).toBe(true);
  });
});
