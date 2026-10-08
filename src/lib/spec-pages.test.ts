import { describe, expect, it } from "vitest";
import type { Element } from "hast";
import {
  SPEC_MIRROR,
  SPEC_SECTIONS,
  requirementAnchors,
  rowRequirement,
  specSections,
  specSlug,
  textOf,
} from "./spec-pages";

const text = (value: string) => ({ type: "text" as const, value });
const el = (tagName: string, children: Element["children"]): Element => ({
  type: "element",
  tagName,
  properties: {},
  children,
});

describe("the mirror", () => {
  it("serves spec under /spec/ from its default branch", () => {
    expect([SPEC_MIRROR.route, SPEC_MIRROR.branch]).toEqual(["spec", "main"]);
    expect(SPEC_MIRROR.include).not.toContain("README.md");
  });
});

describe("textOf", () => {
  it("joins the text of a node and its children, markup left out", () => {
    expect(textOf(el("td", [el("strong", [text("F8-R6")])]))).toBe("F8-R6");
    expect(textOf({ type: "comment", value: "x" })).toBe("");
  });
});

describe("rowRequirement", () => {
  it("reads the identifier a row's first cell defines", () => {
    const row = el("tr", [
      text("\n"),
      el("td", [el("strong", [text(" GOV-R58 ")])]),
      el("td", [text("A repository MUST …")]),
    ]);
    expect(rowRequirement(row)).toBe("GOV-R58");
    expect(rowRequirement(el("tr", [el("th", [text("A1-R1")])]))).toBe("A1-R1");
  });

  it("is null for a row that defines nothing", () => {
    expect(rowRequirement(el("tr", [el("td", [text("ID")])]))).toBeNull();
    expect(rowRequirement(el("tr", [el("span", [text("A1-R1")])]))).toBeNull();
    expect(rowRequirement(el("tr", [text("A1-R1")]))).toBeNull();
    expect(
      rowRequirement(el("tr", [el("td", [text("see A1-R1 and A1-R2")])])),
    ).toBeNull();
  });
});

describe("requirementAnchors", () => {
  it("visits table rows and anchors each that defines a requirement", () => {
    const set: [string, unknown][] = [];
    const context = {
      setProperty: (_node: Readonly<Element>, key: string, value: unknown) => {
        set.push([key, value]);
      },
    };
    const anchors = requirementAnchors.element;
    expect(anchors.filter).toEqual(["tr"]);
    anchors.visit(
      el("tr", [el("td", [el("strong", [text("F8-R6")])])]),
      context,
    );
    anchors.visit(el("tr", [el("th", [text("ID")])]), context);
    expect(set).toEqual([["id", "F8-R6"]]);
  });
});

describe("specSlug", () => {
  it("is the path below /spec/", () => {
    expect(specSlug("spec/50-governance/contributing")).toBe(
      "50-governance/contributing",
    );
  });
});

describe("specSections", () => {
  it("lists each section with its own page and the pages one level in", () => {
    const pages = [
      { id: "spec/50-governance/zeta", title: "Zeta" },
      { id: "spec/50-governance", title: "Governance" },
      { id: "spec/50-governance/alpha", title: "Alpha" },
      { id: "spec/50-governance/alpha/deeper", title: "Deeper" },
      { id: "spec/00-overview/vision", title: "Vision" },
    ];
    const sections = specSections(pages);
    expect(sections.map((s) => s.directory)).toEqual([...SPEC_SECTIONS]);
    const governance = sections.find((s) => s.directory === "50-governance");
    expect(governance?.page?.title).toBe("Governance");
    expect(governance?.pages.map((p) => p.title)).toEqual(["Alpha", "Zeta"]);
    const overview = sections.find((s) => s.directory === "00-overview");
    expect([overview?.page, overview?.pages.length]).toEqual([null, 1]);
  });
});
