import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Every page the site builds from its own templates, and one of each page it
 * builds per record, swept in both themes against WCAG 2.1 AA.
 */
const routes = [
  "/",
  "/transparency/",
  "/contribute/",
  "/404.html",
  "/roadmap/",
  "/roadmap/0.1.0/",
  "/board/",
  "/board/area/A/",
  "/features/A1/",
  "/features/F8/",
  "/repos/",
  "/repos/lemonfiber/",
  "/in-flight/",
  "/pick/",
  "/pick/area/A/",
];
const themes = { light: "paper", dark: "ink" } as const;

for (const route of routes)
  for (const [scheme, theme] of Object.entries(themes))
    test(`${route} meets WCAG 2.1 AA in ${theme}`, async ({ page }) => {
      await page.emulateMedia({
        colorScheme: scheme as keyof typeof themes,
      });
      await page.goto(route);
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
