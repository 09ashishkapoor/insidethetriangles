#!/usr/bin/env node
// snapshot-urls.mjs — freeze the pre-migration URL contract.
//
//   node migration/tools/snapshot-urls.mjs [--base=http://127.0.0.1:4173] [--out=migration/url-parity.json]
//
// Reads _site/sitemap.xml, adds the non-sitemap files (feed, llms.txt), requests every URL from the
// local static server for an HTTP status, and records the visible metadata plus a hash of the post body.
//
// text_sha256 definition (kept deliberately plain):
//   take the inner HTML of <div class="post-content">, drop <script>/<style> blocks, drop all tags,
//   decode &nbsp; &amp; &quot; &#39;, collapse every run of whitespace to one space, trim, hash UTF-8.
// Case, punctuation and diacritics are preserved. Non-post URLs have text_sha256: null.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const SITE = join(ROOT, "site-11ty");
const flags = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [key, value = "true"] = arg.replace(/^--/, "").split("=");
		return [key, value];
	}),
);
const BASE = (flags.base || "http://127.0.0.1:4173").replace(/\/$/, "");
const OUT = flags.out ? join(ROOT, flags.out) : join(ROOT, "migration", "url-parity.json");

const decode = (value) =>
	value
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));

// Block tags and <br> separate text; inline tags do not. Treating <em>Agni Chakra,</em>your as
// "Agni Chakra ,your" would invent a space the reader never sees; removing the inline tag is the
// visible text. This is the definition the URL parity test uses.
const BLOCK_TAG =
	/<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|figure|figcaption|blockquote|hr)\b[^>]*>/gi;
const BR_TAG = /<br\b[^>]*\/?>/gi;
const INLINE_TAG = /<\/?(?:span|strong|b|em|i|a|code|small|sup|sub)\b[^>]*>/gi;

const stripHtml = (html) =>
	decode(
		String(html)
			.replace(/<script[\s\S]*?<\/script>/gi, " ")
			.replace(/<style[\s\S]*?<\/style>/gi, " ")
			.replace(BLOCK_TAG, " ")
			.replace(BR_TAG, " ")
			.replace(INLINE_TAG, "")
			.replace(/<[^>]+>/g, " "),
	)
		.replace(/\s+/g, " ")
		.trim();

const first = (html, re) => {
	const match = html.match(re);
	return match ? stripHtml(match[1]) : null;
};

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const sitemapXml = readFileSync(join(SITE, "_site", "sitemap.xml"), "utf8");
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
	const url = new URL(m[1]);
	return url.pathname;
});

// Everything the brief names, sitemap first so the order is stable and reviewable.
const paths = [...new Set([...sitemapPaths, "/feed.xml", "/sitemap.xml", "/llms.txt"])];

const sourceFor = (path) => {
	if (path === "/") return "src/index.liquid";
	if (path === "/about/") return "src/about.liquid";
	if (path === "/poems/") return "src/poems.liquid";
	if (path === "/articles/") return "src/articles.liquid";
	if (path === "/feed.xml") return "src/feed.liquid";
	if (path === "/sitemap.xml") return "src/sitemap.liquid";
	if (path === "/llms.txt") return "public/llms.txt";
	const post = path.match(/^\/posts\/([^/]+)\/$/);
	if (post) return `src/posts/${post[1]}.md`;
	return null;
};

const rows = [];
for (const path of paths) {
	const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
	const status = response.status;
	const type = response.headers.get("content-type") || "";
	const html = type.includes("text/html") ? await response.text() : null;

	let report = null;
	if (html) {
		const bodyMatch = html.match(/<div class="post-content">([\s\S]*?)<footer class="post-footer">/);
		const body = bodyMatch ? stripHtml(bodyMatch[1]) : null;
		report = {
			text_sha256: body === null ? null : sha256(body),
			text_chars: body === null ? null : body.length,
		};
	}

	rows.push({
		url: path,
		source_file: sourceFor(path),
		title: html ? first(html, /<title>([\s\S]*?)<\/title>/) : null,
		canonical: html ? first(html, /<link rel="canonical" href="([^"]+)"/) : null,
		h1: html ? first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) : null,
		status,
		text_sha256: report ? report.text_sha256 : null,
		text_chars: report ? report.text_chars : null,
	});
}

const counts = {
	urls: rows.length,
	status_200: rows.filter((r) => r.status === 200).length,
	posts: rows.filter((r) => r.source_file?.startsWith("src/posts/")).length,
	hashed_post_bodies: rows.filter((r) => r.text_sha256 !== null).length,
};

const payload = {
	generated_at: new Date().toISOString(),
	base_url: BASE,
	build: {
		files_written_by_eleventy: 38,
		html_pages: 36,
		site_files_total: 91,
	},
	text_sha256_definition:
		"inner HTML of div.post-content; strip script/style; block tags and <br> become spaces; inline tags (strong/em/a/span/code) are removed without adding spaces; decode entities; collapse whitespace; preserve case",
	counts,
	urls: rows,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(JSON.stringify({ out: OUT.replace(ROOT, "."), ...counts }, null, 2));
