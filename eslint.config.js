import js from "@eslint/js";
import globals from "globals";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist/", ".astro/", "eslint.config.js"],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...astro.configs.recommended,

  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],

      // `||` rather than `??` where the left side is a string, deliberately.
      // The GitHub API uses "" for absent — an unnamed release, a repository
      // with no description, a homepage nobody set — so `??` keeps the empty
      // string and the fallback beside it never runs. Six correct expressions
      // here would become six blank fields on the page. Nullish coalescing is
      // still required for everything that is not a string.
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true } },
      ],

      // A number in a template is unambiguous, and `${String(days)}` says less
      // than `${days}` does. Every other type still has to be made a string on
      // purpose, which is what the rule is for: an object interpolated by
      // accident renders as [object Object].
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
  },

  // The Astro parser reports the type of every expression in a template as an
  // error type, so a list rendered from a `.map` is an unsafe return to this
  // rule and to nothing else. `astro check` type-checks these files, at zero
  // hints, and it reads the templates with the compiler that renders them.
  {
    files: ["**/*.astro"],
    rules: { "@typescript-eslint/no-unsafe-return": "off" },
  },

  // The build scripts: Node globals, and a console they are allowed to use,
  // because what they print is what a failing build shows whoever ran it.
  {
    files: ["scripts/**/*.mjs", "*.config.mjs"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off" },
  },
);
