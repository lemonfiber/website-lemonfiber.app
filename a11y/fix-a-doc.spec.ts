import { expect, test } from "@playwright/test";

// Fix a doc reads the site's provenance and the forge's comparison from the
// browser. Both are answered here, so the test reads no network.

const REVISION = "6510356a1b2c3d4e5f60718293a4b5c6d7e8f901";
const PROVENANCE = {
  "/commands/every-command/": {
    repository: "https://github.com/lemonfiber/lemonfiber",
    path: "reference/commands.md",
    revision: REVISION,
  },
};

test.beforeEach(async ({ page }) => {
  await page.route("https://docs.lemonfiber.app/provenance.json", (route) =>
    route.fulfill({ json: PROVENANCE }),
  );
  await page.route(
    /api\.github\.com\/repos\/lemonfiber\/lemonfiber\/compare\//,
    (route) =>
      route.fulfill({
        json: { ahead_by: 3, files: [{ filename: "reference/commands.md" }] },
      }),
  );
});

test("a page's address finds its file, how far behind it is and where to edit it", async ({
  page,
}) => {
  await page.goto("/contribute/fix-a-doc/");
  await page
    .getByLabel("The page's address")
    .fill("https://docs.lemonfiber.app/commands/every-command");
  await page.getByRole("button", { name: "Find" }).click();
  const answer = page.locator(".fad__answer");
  await expect(answer.getByText("reference/commands.md")).toBeVisible();
  await expect(
    answer.getByText("3 commits behind main; the file has changed since"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Edit it on GitHub" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/lemonfiber/lemonfiber/edit/main/reference/commands.md",
  );
});

test("an address on another site, or a page the site does not list, is said", async ({
  page,
}) => {
  await page.goto("/contribute/fix-a-doc/");
  const address = page.getByLabel("The page's address");
  await address.fill("https://example.com/a/");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.getByText("That is not a page on")).toBeVisible();
  await address.fill("https://docs.lemonfiber.app/nowhere/");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(
    page.getByText("The site does not list that page."),
  ).toBeVisible();
});

test("without script, every page the site names is listed with its file", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/contribute/fix-a-doc/");
  // The listing is read from the sites when the site is built; a build that
  // could read none of them says so for each instead of listing nothing.
  const listed = page.locator(".fix__pages li");
  if ((await listed.count()) === 0) {
    await expect(page.locator(".fix__site .fix__note")).toHaveCount(3);
  } else {
    await expect(
      listed.first().getByRole("link", { name: "Edit", includeHidden: true }),
    ).toHaveAttribute(
      "href",
      /^https:\/\/github\.com\/lemonfiber\/[\w.-]+\/edit\/main\//,
    );
  }
  await context.close();
});
