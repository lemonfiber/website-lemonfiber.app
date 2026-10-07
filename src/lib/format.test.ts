import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compact, relativeTime, statusGlyph, statusLabel } from "./format";

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-08T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [undefined, ""],
    ["not a date", ""],
    ["2026-10-08T11:00:00Z", "today"],
    ["2026-10-09T12:00:00Z", "today"],
    ["2026-10-07T12:00:00Z", "yesterday"],
    ["2026-09-28T12:00:00Z", "10d ago"],
    ["2026-07-10T12:00:00Z", "3mo ago"],
    ["2024-10-08T12:00:00Z", "2y ago"],
  ])("%s reads as %j", (iso, said) => {
    expect(relativeTime(iso)).toBe(said);
  });
});

describe("compact", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1k"],
    [1500, "1.5k"],
    [12_400, "12k"],
  ])("%d reads as %s", (n, said) => {
    expect(compact(n)).toBe(said);
  });
});

describe("status words", () => {
  it("gives each state a glyph and a word, and planned for anything else", () => {
    expect(["done", "partial", "todo", "other"].map(statusGlyph)).toEqual([
      "●",
      "◐",
      "○",
      "○",
    ]);
    expect(["done", "partial", "todo", "other"].map(statusLabel)).toEqual([
      "Done",
      "In progress",
      "Planned",
      "Planned",
    ]);
  });
});
