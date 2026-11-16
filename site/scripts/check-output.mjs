#!/usr/bin/env node
// check-output.mjs — the URL contract, after astro build.
// Every baseline URL must exist as a file in dist/; the post count, sitemap count and feed count must
// match the frozen contract. The text hashes are checked by tests/url-parity.spec.ts against a server.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = join(import.meta.dirname, "..");
const DIST = join(SITE, "dist");
const baseline = JSON.parse(readFileSync(join(SITE, "..", "migration", "url-parity.json"), "utf8"));

const fileFor = (url) => {
	if (url === "/") return join(DIST, "index.html");
	if (url === "/feed.xml") return join(DIST, "feed.xml");
	if (url === "/sitemap.xml") return join(DIST, "sitemap.xml");
	if (url === "/llms.txt") return join(DIST, "llms.txt");
	const clean = url.replace(/^\/|\/$/g, "");
	return join(DIST, clean, "index.html");
};

const missing = baseline.urls.map((row) => row.url).filter((url) => !existsSync(fileFor(url)));
if (missing.length) {
	console.error(`✗ ${missing.length} baseline URL${missing.length === 1 ? "" : "s"} missing from dist/`);
	for (const url of missing) console.error(`  ${url}`);
	process.exit(1);
}

const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>/g)].length;
const feed = readFileSync(join(DIST, "feed.xml"), "utf8");
const items = [...feed.matchAll(/<item>/g)].length;
const posts = baseline.urls.filter((row) => row.url.startsWith("/posts/")).length;

if (locs !== 36) {
	console.error(`✗ sitemap has ${locs} <loc>; expected 36`);
	process.exit(1);
}
if (items !== 20) {
	console.error(`✗ feed has ${items} <item>; expected 20`);
	process.exit(1);
}

// The Pages build does not launch a browser; the OG cards are committed. Every collection post must
// have one in dist, and the holding page is the named exception.
const postDirs = readdirSync(join(DIST, "posts"), { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.filter((slug) => slug !== "kali-is-krishna-is-kali");
const missingCards = postDirs.filter((slug) => !existsSync(join(DIST, "images", "og", `${slug}.jpg`)));
if (missingCards.length) {
	console.error(`✗ ${missingCards.length} post${missingCards.length === 1 ? "" : "s"} missing an OG card in dist/images/og`);
	for (const slug of missingCards) console.error(`  ${slug}`);
	process.exit(1);
}

console.log(
	`✓ output — ${baseline.urls.length} baseline URLs, ${posts} posts, ${locs} sitemap locs, ${items} feed items, ${postDirs.length} OG cards`,
);
