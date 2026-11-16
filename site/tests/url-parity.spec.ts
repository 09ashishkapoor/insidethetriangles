import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const baseline = JSON.parse(readFileSync(new URL("../../migration/url-parity.json", import.meta.url), "utf8"));

const decode = (value: string) =>
	value
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));

const BLOCK_TAG =
	/<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|figure|figcaption|blockquote|hr)\b[^>]*>/gi;
const BR_TAG = /<br\b[^>]*\/?>/gi;
const INLINE_TAG = /<\/?(?:span|strong|b|em|i|a|code|small|sup|sub)\b[^>]*>/gi;

const stripHtml = (html: string) =>
	decode(
		html
			.replace(/<script[\s\S]*?<\/script>/gi, " ")
			.replace(/<style[\s\S]*?<\/style>/gi, " ")
			.replace(BLOCK_TAG, " ")
			.replace(BR_TAG, " ")
			.replace(INLINE_TAG, "")
			.replace(/<[^>]+>/g, " "),
	)
		.replace(/\s+/g, " ")
		.trim();

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");

for (const row of baseline.urls) {
	test(`${row.url} matches the frozen contract`, async ({ page, request }) => {
		const response = await request.get(row.url, { failOnStatusCode: false });
		expect(response.status(), `${row.url} status`).toBe(200);

		if (!row.url.startsWith("/posts/")) {
			if (!row.title) return;
			await page.goto(row.url);
			expect(await page.title()).toBe(row.title);
			expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(row.canonical);
			expect((await page.locator("h1").first().innerText()).trim()).toBe(row.h1);
			return;
		}

		await page.goto(row.url);
		expect(await page.title()).toBe(row.title);
		expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(row.canonical);
		expect((await page.locator("h1").first().innerText()).trim()).toBe(row.h1);

		const body = await page.locator("[data-post-body]").first().innerHTML();
		expect(sha256(stripHtml(body)), `${row.url} text hash`).toBe(row.text_sha256);
	});
}
