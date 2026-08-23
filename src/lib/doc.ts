// The shape every content page is written in.
//
// Hand-building each page as its own template guarantees they drift apart in
// styling and in structure. Instead each page is data in i18n/pages.ts and
// renders through one component, so the pages cannot end up laid out
// differently from one another, and a new section type is added once.
//
// Adopted from the beatrax site. The existing hand-built pages (index,
// roadmap, transparency, contribute) are deliberately NOT expressed in this
// shape — they keep their bespoke markup. This is for pages added from here
// on, and is where the existing ones can move to individually if that ever
// looks worth doing.

export interface DocList {
  title?: string;
  body: string;
}

export interface DocTable {
  head: string[];
  rows: string[][];
}

export interface DocSection {
  heading?: string;
  // Paragraphs. Kept as an array rather than one blob so the renderer controls
  // spacing instead of the copy carrying markup.
  body?: string[];
  list?: DocList[];
  // Renders as a definition-style grid rather than bullets — used where each
  // item has a real title worth setting apart.
  cards?: DocList[];
  table?: DocTable;
  // A monospace block, for the commands an install page is mostly made of.
  code?: string;
  note?: string;
  tone?: "default" | "warn" | "accent";
  // Renders the page's slot at this position instead of a section. A doc with
  // no such marker falls back to slotting after the last section.
  slot?: boolean;
}

export interface Doc {
  eyebrow: string;
  title: string;
  lead: string;
  sections: DocSection[];
  // Optional closing call to action.
  cta?: { label: string; href: string; secondaryLabel?: string; secondaryHref?: string };
}
