import { expect, test } from "@playwright/test";

test.describe("smoke coverage", () => {
  test("renders the site shell and primary navigation across key pages", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator("main.site-main")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
    await expect(page.locator(".site-nav a")).toHaveCount(4);

    const pages = [
      { link: "Poems", url: /\/poems\/$/, heading: "Poems" },
      { link: "Articles", url: /\/articles\/$/, heading: "All Posts" },
      { link: "About", url: /\/about\/$/, heading: "About" },
      { link: "Home", url: /\/$/, heading: "Inside The Triangles" },
    ];

    for (const currentPage of pages) {
      await page.getByRole("link", { name: currentPage.link, exact: true }).click();
      await expect(page).toHaveURL(currentPage.url);
      await expect(page.getByRole("heading", { name: currentPage.heading })).toBeVisible();
    }
  });

  test("opens the first homepage post card and renders the detail template", async ({ page }) => {
    await page.goto("/");

    const firstPostLink = page.locator(".post-grid-section .postcard a[href^=\"/posts/\"]").first();
    await expect(firstPostLink).toBeVisible();

    await firstPostLink.click();

    await expect(page).toHaveURL(/\/posts\/.+\/$/);
    await expect(page.locator("article.post")).toBeVisible();
    await expect(page.locator(".post-title")).toBeVisible();
    await expect(page.locator(".post-content")).not.toBeEmpty();
  });

  test("renders a stable poem post and returns home from the template back link", async ({ page }) => {
    await page.goto("/posts/adya-the-originless-one/");

    await expect(page.locator("article.post")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Adya: The Originless One" })).toBeVisible();
    await expect(page.locator(".post-date")).toBeVisible();
    await expect(page.locator(".post-content")).not.toBeEmpty();

    await page.getByRole("link", { name: "← Back to all posts" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Inside The Triangles" })).toBeVisible();
  });
});
