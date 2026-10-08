import { describe, expect, it } from "vitest";
import { assists, type Assist } from "../data/assists";
import { parityTable } from "./assists";

const row = (command: string): Assist => ({
  command,
  usage: `lfdev ${command}`,
  site: null,
  produces: "Nothing.",
  after: null,
});

describe("parityTable", () => {
  it("gives each row the purpose the tool gives its command, in the table's order", () => {
    const rows = parityTable(
      [row("next"), row("doctor")],
      [
        { name: "doctor", purpose: "check this clone" },
        { name: "next", purpose: "goals to pick up" },
      ],
    );
    expect(rows.map((r) => [r.command, r.purpose])).toEqual([
      ["next", "goals to pick up"],
      ["doctor", "check this clone"],
    ]);
  });

  it("fails naming a command either side has and the other does not", () => {
    expect(() =>
      parityTable(
        [row("next"), row("gone")],
        [
          { name: "next", purpose: "x" },
          { name: "new", purpose: "y" },
        ],
      ),
    ).toThrow(
      "src/data/assists.ts differs from lfdev: the table names gone, which lfdev does not list; lfdev lists new, which the table omits",
    );
  });

  it("fails when the snapshot lists no command at all", () => {
    expect(() => parityTable([row("next")], [])).toThrow(
      "lists no lfdev command",
    );
  });

  it("names every command once in the site's own table", () => {
    const commands = assists.map((a) => a.command);
    expect(new Set(commands).size).toBe(commands.length);
  });
});
