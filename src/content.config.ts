// The specification, as one collection rendered at the commit of `spec` the
// board snapshot read (REPO-R79).
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { fileURLToPath } from "node:url";
import { specLoader } from "./lib/spec-source";

/** Where the checkout and the link the kit reads it through are made; outside
 *  `src/`, and ignored by git. */
const root = fileURLToPath(new URL("../.spec", import.meta.url));

export const collections = {
  spec: defineCollection({
    loader: specLoader(root),
    schema: z.object({
      title: z.string(),
      editUrl: z.string(),
      lastUpdated: z.date(),
      mirror: z.object({
        repo: z.string(),
        label: z.string(),
        revision: z.string(),
        date: z.string(),
        source: z.string(),
      }),
    }),
  }),
};
