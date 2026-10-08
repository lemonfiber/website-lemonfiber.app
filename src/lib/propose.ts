// A proposal or a gap, composed in the browser and opened on GitHub under the
// person's own account (D9, D11, D12). The file is the one `lfdev propose` and
// `lfdev gap` write, in the shape spec's `integrity.py` holds a proposal to
// (`10-functional/proposals/README.md`), so `proposal-approve` reads both alike.
//
// Pure functions. The form renders; nothing here does.

/** Where a proposal is added, from the root of spec. */
export const PROPOSALS = "10-functional/proposals";
/** What a proposal's pull request cites: the RFC process. */
export const CITES = "GOV-R40";
/** GitHub's new-file page on spec's main, which forks for a non-writer. */
export const NEW_FILE = "https://github.com/lemonfiber/spec/new/main";

export type Kind = "proposal" | "gap";

/** What a proposal or a gap says. */
export interface Asked {
  kind: Kind;
  area: string;
  title: string;
  amends: string;
  problem: string;
  statements: string[];
  rationale: string;
  missing: string;
}

/** A statement of behaviour uses one of RFC 2119's keywords. */
const KEYWORD = /\b(MUST|SHOULD|MAY)\b/;
/** A requirement row, which a proposal never carries: numbers come on approval. */
const DEFINITION = /^\|\s*\*\*[A-Z]+\d*-R\d+\*\*\s*\|/m;
/** A feature's identifier. */
const FEATURE = /^[A-N]\d+$/;
/** A page of the specification, by path from its root. */
const PAGE = /^[0-9a-z][\w./-]*\.md$/;

/** `text` without the dashes it starts or ends with, read in one pass. */
function trimDashes(text: string): string {
  let start = 0;
  let end = text.length;
  while (start < end && text[start] === "-") start++;
  while (end > start && text[end - 1] === "-") end--;
  return text.slice(start, end);
}

/** A proposal's file name, from its title. */
export function slug(title: string): string {
  return trimDashes(
    trimDashes(title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 56),
  );
}

/** A field as Markdown prose; a line that would open a heading is escaped. */
export function prose(value: string): string {
  return value
    .trim()
    .split("\n")
    .map((line) => (line.trimStart().startsWith("#") ? `\\${line}` : line))
    .join("\n");
}

/** The statements a box holds, one per line, a leading bullet dropped. */
export function statementsOf(box: string): string[] {
  return box
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s+/, ""))
    .filter((line) => line.length > 0);
}

/** The path the file is added at. */
export function filename(asked: Asked): string {
  return `${PROPOSALS}/${slug(asked.title)}.md`;
}

/** The proposal file, in the template's shape. */
export function proposalText(asked: Asked): string {
  const title = asked.title.trim();
  const amends = asked.amends.trim();
  const head = [
    "---",
    `kind: ${asked.kind}`,
    `area: ${asked.area}`,
    `title: ${title}`,
  ];
  if (amends) head.push(`amends: ${amends}`);
  head.push("status: draft", "---", "", `# ${title}`, "");
  const body =
    asked.kind === "gap"
      ? ["## What the specification does not say", "", prose(asked.missing), ""]
      : [
          "## Problem",
          "",
          prose(asked.problem) || "(none given)",
          "",
          "## Proposed behaviour",
          "",
          ...asked.statements.map((s) => `- ${prose(s)}`),
          "",
          "## Rationale",
          "",
          prose(asked.rationale) || "(none given)",
          "",
        ];
  return [...head, ...body].join("\n");
}

/** What is wrong with what was asked, against the catalogue's areas and features. */
export function faults(
  asked: Asked,
  areas: string[],
  features: string[],
): string[] {
  const found: string[] = [];
  const amends = asked.amends.trim();
  if (!areas.includes(asked.area)) found.push("Choose the area it belongs to.");
  if (!asked.title.trim() || asked.title.includes("\n") || !slug(asked.title)) {
    found.push("Give it a title: one line naming the capability.");
  }
  if (
    amends &&
    !(FEATURE.test(amends) && features.includes(amends)) &&
    !PAGE.test(amends)
  ) {
    found.push(
      "What it amends is a feature's identifier, like B3, or a page's path, like 20-architecture/overview.md.",
    );
  }
  if (
    asked.kind === "proposal" &&
    (asked.statements.length === 0 ||
      !asked.statements.every((s) => KEYWORD.test(s)))
  ) {
    found.push(
      "Write at least one statement, and use MUST, SHOULD or MAY in each.",
    );
  }
  if (asked.kind === "gap" && (!amends || !asked.missing.trim())) {
    found.push(
      "Name the feature or page that is silent, and say what it does not say.",
    );
  }
  const texts = [
    asked.problem,
    asked.rationale,
    asked.missing,
    ...asked.statements,
  ];
  if (texts.some((text) => DEFINITION.test(text))) {
    found.push(
      "Leave out requirement rows: identifiers are allocated when it is approved.",
    );
  }
  return found;
}

/** GitHub's new-file page with the file named and filled in. */
export function newFileUrl(asked: Asked): string {
  // Percent-encoded rather than form-encoded, so a space is never a `+`.
  const name = encodeURIComponent(filename(asked));
  const value = encodeURIComponent(proposalText(asked));
  return `${NEW_FILE}?filename=${name}&value=${value}`;
}

/** The pull request's title: the squash commit's subject on main. */
export function pullTitle(asked: Asked): string {
  return `docs(${asked.kind}): ${asked.title.trim()}`;
}

/** The pull request's body, ending with the lines its squash commit needs
 *  (GOV-R62); the sign-off is the person's own, typed in. */
export function pullBody(asked: Asked): string {
  const what = asked.kind === "gap" ? "a gap in" : "a change to";
  return [
    `${asked.title.trim()}: ${what} the specification, as \`${filename(asked)}\`. A maintainer approves it with \`proposal:approved\`, which allocates its identifiers.`,
    "",
    `Spec: ${CITES}`,
    "",
    "Signed-off-by: Your Name <you@example.org>",
  ].join("\n");
}
