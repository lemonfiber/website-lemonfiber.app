#!/usr/bin/env node
// Serves the built site on a free port, runs the browser suites in a11y/
// against it (the axe sweep in both themes, the layout at a phone's width, and
// the board's filters with and without script), and stops the server. Run after
// `npm run build`.
import { fileURLToPath } from "node:url";

import { runA11y } from "@lemonfiber/website-kit/run/a11y";

await runA11y({ root: fileURLToPath(new URL("..", import.meta.url)) });
