#!/usr/bin/env node
// Serves the built site, runs the browser suites in a11y/ against it (the axe
// sweep in both themes, and the board's filters with and without script), and
// stops the server. Run after `npm run build`.
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BIN = `${ROOT}node_modules/.bin/`;
const ORIGIN = "http://127.0.0.1:4321/";
// How many times the server is asked, and how long apart, before it is taken
// as never coming up.
const ATTEMPTS = 120;
const PAUSE_MS = 500;

const server = spawn(
  `${BIN}astro`,
  ["preview", "--port", "4321", "--host", "127.0.0.1"],
  { stdio: "inherit" },
);

// Asked one attempt after another, each waiting on the one before it, so a
// server that answers ends the asking.
async function answered(left = ATTEMPTS) {
  if (left === 0) return false;
  try {
    if ((await fetch(ORIGIN)).ok) return true;
  } catch {
    // not up yet
  }
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  return answered(left - 1);
}

let status = 1;
if (await answered()) {
  status =
    spawnSync(`${BIN}playwright`, ["test"], { stdio: "inherit" }).status ?? 1;
} else {
  console.error("a11y: the preview server never answered");
}
server.kill("SIGTERM");
process.exit(status);
