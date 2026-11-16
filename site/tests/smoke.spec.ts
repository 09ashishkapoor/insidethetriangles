import { expect, test } from "@playwright/test";

test("home presents the yantra, the archive and the four gates", async ({ page }) => {
	await page.goto("/");
	expect(await page.title()).toBe("Inside The Triangles");
	await expect(page.locator("h1").first()).toHaveText("Inside The Triangles");
	await expect(page.locator(".stage .yantra svg")).toBeVisible();
	await expect(page.locator(".archive li")).toHaveCount(12);
	await expect(page.locator(".gate-grid .gate")).toHaveCount(4);
	await expect(page.locator(".bar nav.top a")).toHaveCount(7);
	await expect(page.locator("footer .jai")).toContainText("जय");
});

test("the archive pages carry all pieces and the poems page is poem-only", async ({ page }) => {
	await page.goto("/articles/");
	await expect(page.locator("h1").first()).toHaveText("All Posts");
	await expect(page.locator(".archive li")).toHaveCount(33);

	await page.goto("/poems/");
	await expect(page.locator("h1").first()).toHaveText("Poems");
	await expect(page.locator(".archive li")).toHaveCount(14);
});

test("a poem renders as stanzas, not Ghost HTML", async ({ page }) => {
	await page.goto("/posts/the-serpents-heart/");
	await expect(page.locator("h1").first()).toHaveText("The Serpent’s Heart");
	await expect(page.locator(".verse .stanza")).toHaveCount(7);
	const body = await page.locator("[data-post-body]").innerText();
	expect(body).not.toContain("##");
	expect(body).not.toContain("**");
	expect(body).toContain("The Serpent’s Heart");
});

test("a stotram renders nine verse sections, the strip and the margin", async ({ page }) => {
	await page.goto("/posts/shri-kali-tandava-stotram-translation-and-commentary/");
	await expect(page.locator("h1").first()).toContainText("Shri Kali Tandava Stotram");
	await expect(page.locator(".verse-strip a")).toHaveCount(11);
	await expect(page.locator(".vu")).toHaveCount(9);
	await expect(page.locator(".vu .iast").first()).toContainText("huṃhuṃkāre");
	await expect(page.locator(".margin ol li")).toHaveCount(11);
	const body = await page.locator("[data-post-body]").innerText();
	expect(body).not.toContain("##");
	expect(body).not.toContain("**");
});

test("the image-only post keeps its URL and an empty body", async ({ page }) => {
	await page.goto("/posts/kali-is-krishna-is-kali/");
	await expect(page.locator("h1").first()).toHaveText("Kali is Krishna is Kali");
	await expect(page.locator("[data-post-body]")).toBeEmpty();
	await expect(page.locator(".holding img")).toBeVisible();
});

test("feed, sitemap and llms.txt keep their contracts", async ({ request }) => {
	const feed = await request.get("/feed.xml");
	expect(feed.status()).toBe(200);
	expect((await feed.text()).match(/<item>/g)?.length).toBe(20);

	const sitemap = await request.get("/sitemap.xml");
	expect(sitemap.status()).toBe(200);
	expect((await sitemap.text()).match(/<loc>/g)?.length).toBe(37);

	const llms = await request.get("/llms.txt");
	expect(llms.status()).toBe(200);
	expect(await llms.text()).toContain("Inside The Triangles");
});
