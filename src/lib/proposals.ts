// What the pre-approval feed needs from the board snapshot (GOV-R45): the
// specification's Draft features and requirements and the open `rfc` issues,
// each with where it is read.
//
// Pure functions over the snapshot. Components render; nothing here does.

import type { Board, Proposal } from "./board";
import { plainText, requirementPage } from "./feature-page";
import { featureSources, requirementUrl } from "./roadmap";

/** One item of the feed, with the page on this site and its source. */
export interface FeedItem {
  proposal: Proposal;
  /** How it is named: its identifier, or an issue's number. */
  label: string;
  /** Its title, without Markdown's syntax. */
  title: string;
  /** Where this site shows it, or null where it shows it nowhere. */
  page: string | null;
  /** Where it is read: its file in `spec`, or its issue. */
  source: string | null;
}

/** The kinds of the feed, in the order the page lists them. */
export const FEED_KINDS = ["feature", "requirement", "rfc"] as const;

/** The feed, grouped by kind, in the snapshot's order within each. */
export function feed(
  board: Pick<Board, "proposals" | "features" | "requirements" | "sources">,
): { kind: Proposal["kind"]; items: FeedItem[] }[] {
  const sources = featureSources(board);
  const item = (proposal: Proposal): FeedItem => {
    const id = String(proposal.id);
    if (proposal.kind === "feature") {
      return {
        proposal,
        label: id,
        title: proposal.title,
        page: sources[id] ? `/features/${id}/` : null,
        source: sources[id] ?? null,
      };
    }
    if (proposal.kind === "requirement") {
      return {
        proposal,
        label: id,
        title: plainText(proposal.title),
        page: requirementPage(board, id),
        source: requirementUrl(board, id),
      };
    }
    return {
      proposal,
      label: `#${id}`,
      title: proposal.title,
      page: null,
      source: proposal.url,
    };
  };
  return FEED_KINDS.map((kind) => ({
    kind,
    items: board.proposals.filter((p) => p.kind === kind).map(item),
  }));
}
