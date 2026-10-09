import AxeBuilder from "@axe-core/playwright";
import { layoutViolations, probeLayout } from "@lemonfiber/website-kit/layout";
import { expect, test } from "@playwright/test";

/**
 * Every page the site builds from its own templates, and one of each page it
 * builds per record, swept in both themes against WCAG 2.2 AA, and laid out
 * at a phone's width.
 */
const routes = [
  "/",
  "/transparency/",
  "/contribute/",
  "/contribute/fix-a-doc/",
  "/contribute/propose/",
  "/404.html",
  "/roadmap/",
  "/roadmap/0.1.0/",
  "/board/",
  "/board/area/A/",
  "/features/A1/",
  "/features/F8/",
  "/repos/",
  "/repos/lemonfiber/",
  "/repos/dot-github/",
  "/in-flight/",
  "/pick/",
  "/pick/area/A/",
  "/releases/",
  "/releases/0.1.0/",
  "/proposals/",
  "/spec/",
  "/spec/50-governance/working-in-the-repositories/",
  "/spec/70-operations/board-format/",
];
const themes = { light: "paper", dark: "ink" } as const;

for (const route of routes)
  for (const [scheme, theme] of Object.entries(themes))
    test(`${route} meets WCAG 2.2 AA in ${theme}`, async ({ page }) => {
      await page.emulateMedia({
        colorScheme: scheme as keyof typeof themes,
      });
      await page.goto(route);
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });

/** The narrowest screen the site is laid out for. */
const PHONE = { width: 375, height: 800 };

for (const route of routes)
  test(`${route} fits a phone's width`, async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto(route);
    expect(layoutViolations(route, await page.evaluate(probeLayout))).toEqual(
      [],
    );
  });

/**
 * A claim page's id is a goal still on offer, which changes as goals are
 * taken, so the one checked is the first the pick list links to.
 */
test("a claim page meets WCAG 2.2 AA in both themes and fits a phone", async ({
  page,
}) => {
  await page.goto("/pick/");
  const route = await page
    .locator("a.goal__claim")
    .first()
    .getAttribute("href");
  expect(route).toMatch(/^\/claim\/[^/]+\/$/);
  const claim = route ?? "";
  for (const [scheme, theme] of Object.entries(themes)) {
    await page.emulateMedia({ colorScheme: scheme as keyof typeof themes });
    await page.goto(claim);
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page.setViewportSize(PHONE);
  await page.goto(claim);
  expect(layoutViolations(claim, await page.evaluate(probeLayout))).toEqual([]);
});

test("the menu opens below the bar, with every link on screen", async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");
  await page.locator("[data-nav-toggle]").click();
  const bar = await page.locator(".nav").boundingBox();
  const links = page.locator("[data-nav-panel] a");
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    const box = await link.boundingBox();
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(
      (bar?.y ?? 0) + (bar?.height ?? 0),
    );
    expect((box?.x ?? -1) + (box?.width ?? 0)).toBeLessThanOrEqual(PHONE.width);
  }
});
