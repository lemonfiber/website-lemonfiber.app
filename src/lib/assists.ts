// The parity table against the command line it stands for. Every row names a
// command of `lfdev`, and every command the snapshot's `tools[]` lists has a
// row: a command added to the tool, or one taken out, fails the build until
// the table says so too (GOV-R61).

import type { Assist } from "../data/assists";
import type { Tool } from "./board";

/** A row of the table, with the purpose the tool gives its command. */
export interface ParityRow extends Assist {
  purpose: string;
}

/** The table with each command's purpose, or a build that fails naming every
 *  command one side has and the other does not. */
export function parityTable(table: Assist[], tools: Tool[]): ParityRow[] {
  if (tools.length === 0) {
    throw new Error(
      "the board snapshot lists no lfdev command, so the parity table cannot be checked",
    );
  }
  const purpose = new Map(tools.map((tool) => [tool.name, tool.purpose]));
  const rows = new Set(table.map((row) => row.command));
  const said: string[] = [];
  const out: ParityRow[] = [];
  for (const row of table) {
    const given = purpose.get(row.command);
    if (given === undefined) {
      said.push(`the table names ${row.command}, which lfdev does not list`);
    } else {
      out.push({ ...row, purpose: given });
    }
  }
  for (const tool of tools) {
    if (!rows.has(tool.name))
      said.push(`lfdev lists ${tool.name}, which the table omits`);
  }
  if (said.length > 0) {
    throw new Error(
      `src/data/assists.ts differs from lfdev: ${said.join("; ")}`,
    );
  }
  return out;
}
