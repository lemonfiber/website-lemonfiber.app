import { describe, expect, it } from "vitest";
import {
  againstCap,
  repoMapUrl,
  repoPageUrl,
  repoState,
  repoStates,
  trackerUrl,
  repoRoute,
  repoSlug,
} from "./repos";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const SPEC = `https://github.com/lemonfiber/spec/blob/${"a".repeat(40)}`;

describe("repoState", () => {
  it("counts its tracker's rows and lists its open pull requests", () => {
    const [, lemonfiber] = repoStates(board);
    expect(lemonfiber?.rows).toEqual({ open: 0, partial: 0, done: 1 });
    expect(lemonfiber?.pulls.map((p) => p.number)).toEqual([7, 8]);
  });

  it("holds the goals of the version taking work that its tracker holds", () => {
    const [, lemonfiber] = repoStates(board);
    expect(lemonfiber?.version?.version.version).toBe("0.3.0");
    expect(lemonfiber?.version?.goals.map((g) => g.id)).toEqual(["A1-R1"]);
  });

  it("holds no version where none taking work is satisfied there", () => {
    const [spec] = repoStates(board);
    expect(spec?.version).toBeNull();
    expect(spec?.rows).toEqual({ open: 0, partial: 0, done: 0 });
  });

  it("reads one repository on its own", () => {
    const sdk = board.repos[2];
    expect(sdk && repoState(board, sdk).pulls).toEqual([]);
  });
});

describe("againstCap", () => {
  it("splits the open pull requests, or says nothing where none were read", () => {
    expect(againstCap({ open_pulls: 5, counted_pulls: 3 })).toEqual({
      counted: 3,
      bots: 2,
    });
    expect(againstCap({ open_pulls: null, counted_pulls: null })).toBeNull();
    expect(againstCap({ open_pulls: 1, counted_pulls: null })).toBeNull();
  });
});

describe("addresses", () => {
  it("names a tracker's file, or the directory a split one keeps", () => {
    const core = `https://github.com/lemonfiber/lemonfiber`;
    expect(trackerUrl(board, "lemonfiber", "status/A1.toml")).toBe(
      `${core}/tree/${"b".repeat(40)}/status`,
    );
    expect(trackerUrl(board, "lemonfiber", "status.toml")).toBe(
      `${core}/blob/${"b".repeat(40)}/status.toml`,
    );
    const [spec, lemonfiber] = repoStates(board);
    expect(spec?.trackerUrl).toBeNull();
    expect(lemonfiber?.trackerUrl).toBe(
      `${core}/tree/${"b".repeat(40)}/status`,
    );
  });

  it("resolves a specification page against the map's directory", () => {
    expect(repoPageUrl(board, "../README.md")).toBe(`${SPEC}/README.md`);
    expect(repoPageUrl(board, "lemonfiber.md")).toBe(
      `${SPEC}/30-repos/lemonfiber.md`,
    );
    expect(repoMapUrl(board)).toBe(`${SPEC}/30-repos/repos.toml`);
  });
});

describe("repoRoute", () => {
  it("is the repository's name below /repos/", () => {
    expect(repoRoute("lemonfiber")).toBe("/repos/lemonfiber/");
    expect(repoSlug("sdk-ts")).toBe("sdk-ts");
  });

  it("spells a leading dot out, since a hidden directory is not served", () => {
    expect(repoRoute(".github")).toBe("/repos/dot-github/");
    expect(repoSlug(".github")).toBe("dot-github");
  });
});
