import { describe, expect, it } from "vitest";
import { claimPages, claimRow, editorFor, holders, offered } from "./claim";
import { fixtureBoard } from "../test/board.fixture";

const board = fixtureBoard();
const row = {
  id: "A1-R1",
  state: "done" as const,
  evidence: [],
  landed: null,
  path: "status/A1.toml",
};
const planned = board.versions.find((v) => v.version === "0.3.0");
if (!planned) throw new Error("the fixture has no 0.3.0");

describe("claimRow", () => {
  it("is the requirement, open, as a tracker writes it", () => {
    expect(claimRow("B1-R1")).toBe(
      '[[requirement]]\nid = "B1-R1"\nstate = "open"\n',
    );
  });
});

describe("editorFor", () => {
  it("opens the feature's tracker file in a repository that splits them", () => {
    const split = {
      trackers: [
        {
          repo: "lemonfiber",
          present: true,
          rows: [
            { ...row, path: "status/A1.toml" },
            { ...row, path: "status/B1.toml" },
          ],
        },
      ],
    };
    expect(editorFor(split, "lemonfiber", "B1-R1")).toEqual({
      path: "status/B1.toml",
      url: "https://github.com/lemonfiber/lemonfiber/edit/main/status/B1.toml",
      creates: false,
    });
  });

  it("offers GitHub's new-file page, the row filled in, for a feature with no file yet", () => {
    const editor = editorFor(board, "lemonfiber", "B1-R1");
    expect(editor?.path).toBe("status/B1.toml");
    expect(editor?.creates).toBe(true);
    const url = new URL(editor?.url ?? "");
    expect(url.pathname).toBe("/lemonfiber/lemonfiber/new/main");
    expect(url.searchParams.get("filename")).toBe("status/B1.toml");
    expect(url.searchParams.get("value")).toBe(claimRow("B1-R1"));
  });

  it("uses the one tracker file of a repository that keeps one", () => {
    const single = {
      trackers: [
        {
          repo: "sdk-ts",
          present: true,
          rows: [{ ...row, path: "status.toml" }],
        },
      ],
    };
    expect(editorFor(single, "sdk-ts", "B1-R1")).toEqual({
      path: "status.toml",
      url: "https://github.com/lemonfiber/sdk-ts/edit/main/status.toml",
      creates: false,
    });
  });

  it("says nothing where the snapshot does not show how the repository keeps its tracker", () => {
    expect(editorFor(board, "sdk-php", "B1-R1")).toBeNull();
  });
});

describe("holders", () => {
  it("is every open pull request from a person citing the goal, once each", () => {
    const found = holders(board, "GOV-R2", [
      {
        repo: "lemonfiber",
        number: 7,
        url: "https://github.com/lemonfiber/lemonfiber/pull/7",
      },
      { repo: "sdk-ts", number: 3, url: "https://x/3" },
    ]);
    expect(found).toEqual([
      {
        repo: "lemonfiber",
        number: 7,
        url: "https://github.com/lemonfiber/lemonfiber/pull/7",
        author: "someone",
      },
      {
        repo: "lemonfiber",
        number: 8,
        url: "https://github.com/lemonfiber/lemonfiber/pull/8",
        author: "another",
      },
      { repo: "sdk-ts", number: 3, url: "https://x/3", author: null },
    ]);
  });

  it("leaves out a bot's pull request", () => {
    const bot = {
      pulls: board.pulls.map((p) => ({ ...p, cites: ["B1-R1"] })),
    };
    expect(holders(bot, "B1-R1", []).map((h) => h.number)).toEqual([7, 8]);
  });
});

describe("claimPages", () => {
  const pages = claimPages(board);

  it("is one page per goal of the versions taking work", () => {
    expect(pages.map((p) => [p.id, p.version, p.verdict])).toEqual([
      ["B1-R1", "0.3.0", "open"],
      ["A1-R1", "0.3.0", "unknown"],
      ["GOV-R2", "0.3.0", "claimed"],
    ]);
  });

  it("says each goal once, in the earlier version, where two lock it", () => {
    const twice = {
      ...board,
      versions: [...board.versions, { ...planned, version: "0.4.0" }],
    };
    expect(claimPages(twice).map((p) => `${p.id}@${p.version}`)).toEqual([
      "B1-R1@0.3.0",
      "A1-R1@0.3.0",
      "GOV-R2@0.3.0",
    ]);
  });

  it("carries the requirement's words and page, and the two ways to claim it", () => {
    const b1 = pages.find((p) => p.id === "B1-R1");
    expect(b1).toMatchObject({
      text: "B1-R1 MUST hold.",
      page: "/features/B1/#B1-R1",
      command: "lfdev claim B1-R1",
      row: claimRow("B1-R1"),
      title: "chore(claim): B1-R1",
      cap: 3,
      holders: [],
    });
    expect(b1?.body.split("\n").slice(-3)).toEqual([
      "Spec: B1-R1",
      "",
      "Signed-off-by: Your Name <you@example.org>",
    ]);
  });

  it("names the holders of a claimed goal", () => {
    const gov = pages.find((p) => p.id === "GOV-R2");
    expect(gov?.holders.map((h) => h.author)).toEqual(["someone", "another"]);
    expect([gov?.text, gov?.page]).toEqual([null, null]);
  });

  it("counts each repository's open pull requests against the cap", () => {
    const b1 = pages.find((p) => p.id === "B1-R1");
    expect(b1?.repos).toEqual([
      {
        repo: "lemonfiber",
        counted: 2,
        atCap: false,
        editor: editorFor(board, "lemonfiber", "B1-R1"),
      },
    ]);
    const full = {
      ...board,
      repos: board.repos.map((r) =>
        r.name === "lemonfiber" ? { ...r, counted_pulls: 3 } : r,
      ),
    };
    expect(claimPages(full)[0]?.repos[0]?.atCap).toBe(true);
    const unread = {
      ...board,
      repos: board.repos.filter((r) => r.name !== "lemonfiber"),
    };
    expect(claimPages(unread)[0]?.repos[0]).toMatchObject({
      counted: null,
      atCap: false,
    });
  });
});

describe("offered", () => {
  it("offers a claim on an unmet goal nobody holds, and on nothing else", () => {
    const holder = {
      repo: "r",
      number: 1,
      url: "u",
      author: null,
    };
    expect(offered({ verdict: "open", holders: [] })).toBe(true);
    expect(offered({ verdict: "met", holders: [] })).toBe(false);
    expect(offered({ verdict: "open", holders: [holder] })).toBe(false);
  });
});
