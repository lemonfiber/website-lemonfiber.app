// The specification as this site renders it (REPO-R79): one mirror of `spec`,
// read at the commit the board snapshot read, so the text a requirement shows
// here and the verdict the board gives it are the same revision. Routes, titles,
// link rewriting and provenance are the kit's, which the documentation site
// runs too; what is this site's own is the mirror's declaration and the anchor
// every requirement row carries.
//
// Pure functions. Reading the checkout is `spec-source.ts`.

import type { Element, ElementContent, RootContent } from "hast";
import type { Mirror } from "@lemonfiber/website-kit/mirror";

/** The route the specification is served under. */
export const SPEC_ROUTE = "spec";

/** The parts of `spec` a reader is meant to read, in the order they read. */
export const SPEC_SECTIONS = [
  "00-overview",
  "10-functional",
  "20-architecture",
  "30-repos",
  "40-quality",
  "50-governance",
  "60-brand",
  "70-operations",
  "90-appendix",
] as const;

/** The one mirror: every part of `spec` a reader is meant to read. */
export const SPEC_MIRROR: Mirror = {
  route: SPEC_ROUTE,
  repo: "spec",
  path: "",
  remote: "https://github.com/lemonfiber/spec",
  branch: "main",
  label: "lemonfiber/spec",
  // The README heads the repository on the forge, with badges and images
  // served from elsewhere; this site's index of the specification is its own.
  include: SPEC_SECTIONS,
};

/** A requirement's identifier, the whole of a table cell: `F8-R6`, `GOV-R58`. */
const REQUIREMENT_ID = /^[A-Z][A-Z0-9]*-R\d+$/;

/** The text a node holds, its markup left out. */
export function textOf(node: ElementContent | RootContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

/** The identifier a table row defines, read from its first cell, or null. */
export function rowRequirement(row: Readonly<Element>): string | null {
  const first = row.children.find(
    (child): child is Element => child.type === "element",
  );
  if (!first || (first.tagName !== "td" && first.tagName !== "th")) return null;
  const text = textOf(first).trim();
  return REQUIREMENT_ID.test(text) ? text : null;
}

/** What a plugin is handed with each node it visits: here, only the means to
 *  set an attribute. */
export interface AnchorContext {
  setProperty(node: Readonly<Element>, key: string, value: unknown): void;
}

/** A hast plugin for the site's Markdown processor that gives every
 *  requirement row the requirement's identifier as its anchor, so
 *  `/spec/…/#F8-R6` lands on the row that defines it. */
export const requirementAnchors = {
  name: "lemonfiber-requirement-anchors",
  element: {
    filter: ["tr"],
    visit(row: Readonly<Element>, context: AnchorContext): void {
      const id = rowRequirement(row);
      if (id) context.setProperty(row, "id", id);
    },
  },
};

/** The route parameter a page of the specification is built at: its
 *  collection id below the specification's own route. */
export function specSlug(id: string): string {
  return id.slice(SPEC_ROUTE.length + 1);
}

/** One page of the specification, as the index lists it. */
export interface SpecPage {
  id: string;
  title: string;
}

/** One top-level section of the specification: its own page where it has
 *  one, and the pages directly inside it. */
export interface SpecSection {
  directory: string;
  page: SpecPage | null;
  pages: SpecPage[];
}

/** The specification's sections, in the mirror's order, each with the pages
 *  one level inside it in path order. */
export function specSections(pages: readonly SpecPage[]): SpecSection[] {
  const sections = SPEC_SECTIONS.map((directory) => ({
    directory,
    route: `${SPEC_ROUTE}/${directory.toLowerCase()}`,
  }));
  return sections.map(({ directory, route }) => ({
    directory,
    page: pages.find((p) => p.id === route) ?? null,
    pages: pages
      .filter((p) => {
        const rest = p.id.startsWith(`${route}/`)
          ? p.id.slice(route.length + 1)
          : "";
        return rest !== "" && !rest.includes("/");
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  }));
}
