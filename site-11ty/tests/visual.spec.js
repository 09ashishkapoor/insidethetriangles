import { expect, test } from "@playwright/test";

const screenshotOptions = {
  animations: "disabled",
  caret: "hide",
  scale: "css",
};

test.describe("visual baselines", () => {
  test("site header remains stable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header.site-header")).toHaveScreenshot("site-header.png", screenshotOptions);
  });

  test("homepage hero remains stable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section.hero")).toHaveScreenshot("home-hero.png", screenshotOptions);
  });

  test("stable post header remains stable", async ({ page }) => {
    await page.goto("/posts/adya-the-originless-one/");
    await expect(page.locator(".post-header")).toHaveScreenshot("post-header.png", screenshotOptions);
  });
});
