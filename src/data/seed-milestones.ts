// The committed milestone snapshot — the offline fallback, and nothing else.
//
// Used only when the implementation status file is unreachable at build time,
// so a build (and local dev without network) never fails. When the file is
// reachable it is the only source: the milestones, their names, their order,
// their marks and their counts all come from it, and nothing here is read.
//
// Generated from lemonfiber/IMPLEMENTATION-STATUS.md by the same reading the
// build does, so the snapshot renders the page a live build would. Regenerate
// it that way; do not edit a row by hand.

import type { DeliverableStatus, Milestone } from "../lib/types";

const at = (
  id: string,
  title: string,
  status: DeliverableStatus,
  done: number,
  total: number,
): Milestone => ({
  id,
  title,
  status,
  done,
  total,
  pct: total === 0 ? 0 : Math.round((done / total) * 100),
});

export const seedMilestones: Milestone[] = [
  at("M0", "Specification", "done", 0, 0),
  at("M0.5", "Governance in force", "done", 0, 0),
  at("M1", "lemonfiber-media-stack standalone", "done", 0, 0),
  at("M2", "Core: manifest, compose driver, CLI", "done", 9, 9),
  at("M3", "Setup wizard + doctor", "done", 26, 27),
  at("M4", "Seed & backup", "partial", 17, 19),
  at("M5", "Trust checks", "partial", 6, 6),
  at("M6", "Live TUI", "partial", 26, 31),
  at("M7", "Web surface & UX", "partial", 9, 12),
  at("M8", "Household & content", "todo", 0, 0),
  at("M9", "Lifecycle & maintenance", "partial", 2, 2),
  at("M10", "Release engineering", "partial", 1, 7),
];
