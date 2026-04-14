import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("about page shared chrome and static content are accessible", async ({ page }) => {
  await page.goto("/about/");

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include("header.site-header")
    .include("main.site-main")
    .include("footer.site-footer")
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
