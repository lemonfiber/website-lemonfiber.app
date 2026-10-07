import { expect, test } from "@playwright/test";

// The filters are part of the address: a board opened with one shows only the
// cards it matches, and changing one rewrites the address.

test("a filter in the address hides the cards it does not match", async ({
  page,
}) => {
  await page.goto("/board/?area=A");
  await expect(page.locator("#bf-area")).toHaveValue("A");
  const shown = page.locator("[data-feature]:visible");
  await expect(shown.first()).toBeVisible();
  for (const id of await shown.evaluateAll((cards) =>
    cards.map((c) => c.getAttribute("data-feature") ?? ""),
  ))
    expect(id).toMatch(/^A\d+$/);
});

test("choosing a filter rewrites the address, and clearing restores it", async ({
  page,
}) => {
  await page.goto("/board/");
  const all = await page.locator("[data-feature]").count();
  await page.locator("#bf-area").selectOption("B");
  await expect(page).toHaveURL(/\/board\/\?area=B$/);
  expect(await page.locator("[data-feature]:visible").count()).toBeLessThan(
    all,
  );
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/board\/$/);
  await expect(page.locator("[data-feature]:visible")).toHaveCount(all);
});

test("without script every card shows and the filtered pages are linked", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/board/?area=A");
  const all = await page.locator("[data-feature]").count();
  await expect(page.locator("[data-feature]:visible")).toHaveCount(all);
  await page.goto("/board/area/A/");
  for (const id of await page
    .locator("[data-feature]")
    .evaluateAll((cards) => cards.map((c) => c.getAttribute("data-feature"))))
    expect(id).toMatch(/^A\d+$/);
  await context.close();
});
