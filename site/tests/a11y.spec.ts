import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
	"/",
	"/poems/",
	"/articles/",
	"/about/",
	"/posts/the-serpents-heart/",
	"/posts/shri-kali-tandava-stotram-translation-and-commentary/",
	"/posts/the-alchemy-of-desire-transforming-physicality-into-spiritual-mastery/",
	"/posts/kali-is-krishna-is-kali/",
];

for (const url of pages) {
	test(`no serious or critical axe violations on ${url}`, async ({ page }) => {
		await page.goto(url);
		const results = await new AxeBuilder({ page }).analyze();
		const blocking = results.violations.filter((violation) =>
			["serious", "critical"].includes(violation.impact ?? ""),
		);
		expect(
			blocking.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`),
		).toEqual([]);
	});
}
