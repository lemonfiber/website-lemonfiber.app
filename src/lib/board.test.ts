import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOARD_URL, FORMAT, parseBoard, readSnapshot } from "./board";
import { fixtureBoard } from "../test/board.fixture";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("parseBoard", () => {
  it("reads a snapshot in the format this site knows", () => {
    const board = fixtureBoard();
    expect(parseBoard(JSON.parse(JSON.stringify(board)))).toEqual(board);
  });

  it("refuses a snapshot that is not an object", () => {
    expect(() => parseBoard([])).toThrow("not an object");
    expect(() => parseBoard(null)).toThrow("not an object");
  });

  it("refuses a format it does not know, naming both", () => {
    expect(() => parseBoard({ ...fixtureBoard(), format: 2 })).toThrow(
      `board.json is format 2; this site reads format ${FORMAT}`,
    );
    expect(() => parseBoard({ generated_at: "x" })).toThrow(
      "is format undefined",
    );
  });

  it("refuses a snapshot with no time or no sources", () => {
    expect(() => parseBoard({ ...fixtureBoard(), generated_at: 1 })).toThrow(
      "no time or no sources",
    );
    expect(() => parseBoard({ ...fixtureBoard(), sources: [] })).toThrow(
      "no time or no sources",
    );
  });

  it("names every list it does not carry", () => {
    const board: Record<string, unknown> = { ...fixtureBoard() };
    delete board.pulls;
    delete board.releases;
    expect(() => parseBoard(board)).toThrow("no list for pulls, releases");
  });

  it.each([
    ["not an object", "0.1.0"],
    [
      "a version that is not a string",
      { version: 1, status: "planned", milestone: null, goals: [] },
    ],
    [
      "a status that is not a string",
      { version: "0.1.0", milestone: null, goals: [] },
    ],
    [
      "a milestone that is neither text nor null",
      { version: "0.1.0", status: "planned", milestone: 3, goals: [] },
    ],
    [
      "goals that are not a list",
      { version: "0.1.0", status: "planned", milestone: null, goals: 3 },
    ],
  ])("refuses a version that is %s, naming where", (_why, bad) => {
    const board = fixtureBoard();
    expect(() =>
      parseBoard({ ...board, versions: [...board.versions, bad] }),
    ).toThrow("versions[3] is not a version");
  });
});

describe("readSnapshot", () => {
  it("reads the published address unless told otherwise", async () => {
    const fetched = vi.fn(() =>
      Promise.resolve(new Response("{}", { status: 200 })),
    );
    vi.stubGlobal("fetch", fetched);
    vi.stubEnv("BOARD_SNAPSHOT", "");
    await expect(readSnapshot()).resolves.toBe("{}");
    expect(fetched).toHaveBeenCalledWith(BOARD_URL, expect.anything());
  });

  it("reads a URL that BOARD_SNAPSHOT names", async () => {
    const fetched = vi.fn(() => Promise.resolve(new Response("[]")));
    vi.stubGlobal("fetch", fetched);
    vi.stubEnv("BOARD_SNAPSHOT", "https://example.test/board.json");
    await expect(readSnapshot()).resolves.toBe("[]");
    expect(fetched).toHaveBeenCalledWith(
      "https://example.test/board.json",
      expect.anything(),
    );
  });

  it("fails on an answer that is not a success", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve(new Response("gone", { status: 404 })),
    );
    await expect(readSnapshot("https://example.test/b.json")).rejects.toThrow(
      "https://example.test/b.json answered 404",
    );
  });

  it("reads a file that is not a URL", async () => {
    const dir = await mkdtemp(join(tmpdir(), "board-"));
    const path = join(dir, "board.json");
    await writeFile(path, '{"format":1}');
    await expect(readSnapshot(path)).resolves.toBe('{"format":1}');
  });
});

describe("loadBoard", () => {
  it("parses the snapshot once per build", async () => {
    const dir = await mkdtemp(join(tmpdir(), "board-"));
    const path = join(dir, "board.json");
    await writeFile(path, JSON.stringify(fixtureBoard()));
    vi.stubEnv("BOARD_SNAPSHOT", path);
    const { loadBoard } = await import("./board");
    const first = loadBoard();
    expect(loadBoard()).toBe(first);
    expect((await first).versions).toHaveLength(3);
  });

  it("fails the build on a snapshot it cannot read", async () => {
    const dir = await mkdtemp(join(tmpdir(), "board-"));
    const path = join(dir, "board.json");
    await writeFile(path, JSON.stringify({ ...fixtureBoard(), format: 9 }));
    vi.stubEnv("BOARD_SNAPSHOT", path);
    const { loadBoard } = await import("./board");
    await expect(loadBoard()).rejects.toThrow("format 9");
  });
});
