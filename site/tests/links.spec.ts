import { expect, test } from "@playwright/test";

const pages = ["/", "/poems/", "/articles/", "/about/", "/posts/the-serpents-heart/", "/posts/shri-kali-tandava-stotram-translation-and-commentary/"];

for (const url of pages) {
	test(`internal links resolve on ${url}`, async ({ page, request, baseURL }) => {
		await page.goto(url);
		const hrefs = await page.locator("a[href]").evaluateAll((links) =>
			links.map((link) => link.getAttribute("href") ?? ""),
		);
		const internal = [...new Set(hrefs.filter((href) => href.startsWith("/") && !href.startsWith("//")))];
		for (const href of internal) {
			const target = new URL(href, baseURL);
			const response = await request.get(target.pathname, { failOnStatusCode: false });
			expect(response.status(), `${url} -> ${href}`).toBe(200);
		}
	});
}
