import { expect, test } from "@playwright/test";

test("homepage stays within the repo-specific performance budget", async ({
	page,
}) => {
	await page.goto("/", { waitUntil: "load" });

	const performanceSummary = await page.evaluate(() => {
		const [navigationEntry] = performance.getEntriesByType("navigation");
		const resourceEntries = performance
			.getEntriesByType("resource")
			.map((entry) => ({
				name: entry.name,
				initiatorType: entry.initiatorType,
				encodedBodySize: entry.encodedBodySize,
				transferSize: entry.transferSize,
			}));

		return {
			navigation: {
				domContentLoaded: navigationEntry.domContentLoadedEventEnd,
				load: navigationEntry.loadEventEnd,
				encodedBodySize: navigationEntry.encodedBodySize,
			},
			resources: resourceEntries,
		};
	});

	const stylesheet = performanceSummary.resources.find((resource) =>
		resource.name.endsWith("/css/style.css"),
	);
	const heroImage = performanceSummary.resources.find((resource) =>
		resource.name.endsWith("/images/2025/06/boo2.jpg"),
	);
	const scriptResources = performanceSummary.resources.filter(
		(resource) => resource.initiatorType === "script",
	);
	const totalResourceBytes = performanceSummary.resources.reduce(
		(total, resource) => total + (resource.encodedBodySize || 0),
		0,
	);

	expect(performanceSummary.navigation.encodedBodySize).toBeLessThan(20_000);
	expect(performanceSummary.navigation.domContentLoaded).toBeLessThan(1_200);
	expect(performanceSummary.navigation.load).toBeLessThan(2_000);
	expect(stylesheet).toBeDefined();
	expect(stylesheet?.encodedBodySize ?? Number.POSITIVE_INFINITY).toBeLessThan(
		20_000,
	);
	expect(heroImage).toBeDefined();
	expect(heroImage?.encodedBodySize ?? Number.POSITIVE_INFINITY).toBeLessThan(
		60_000,
	);
	expect(totalResourceBytes).toBeLessThan(250_000);
	expect(performanceSummary.resources.length).toBeLessThanOrEqual(4);
	expect(scriptResources).toHaveLength(0);
});
