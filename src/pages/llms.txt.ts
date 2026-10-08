// `/llms.txt`, generated at build time from the board snapshot and the copy
// each page renders.
import type { APIRoute } from "astro";
import { loadBoard } from "../lib/board";
import { llmsText } from "../lib/llms";
import { projectPages } from "../data/pages";
import {
  docsPages,
  llmsAboutSite,
  llmsInstalling,
  llmsIntro,
  llmsPrecisely,
  llmsStatus,
} from "../data/llms";

export const GET: APIRoute = async () =>
  new Response(
    llmsText(await loadBoard(), projectPages, {
      intro: llmsIntro,
      docs: docsPages,
      precisely: llmsPrecisely,
      installing: llmsInstalling,
      status: llmsStatus,
      aboutSite: llmsAboutSite,
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
