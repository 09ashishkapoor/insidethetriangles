#!/usr/bin/env node
// validate-content.mjs — the body half of the door. Astro's content schema already fails the build on a
// bad title/date/form/deity/excerpt; this checks the conventions the schema cannot see.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseFrontMatter } from "./lib/frontmatter.mjs";
import { wordCount } from "./lib/text.mjs";

const SITE = join(import.meta.dirname, "..");
const POSTS = join(SITE, "src", "content", "posts");
const HTML = /<\/?(p|div|span|br|img|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|figure|figcaption|iframe|script|style|hr)\b[^>]*>/i;

const files = readdirSync(POSTS, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => join(POSTS, entry.name, "index.md"))
	.filter((file) => existsSync(file));

const errors = [];
for (const file of files) {
	const { data, body, errors: fmErrors } = parseFrontMatter(readFileSync(file, "utf8"), file);
	const slug = data.slug ?? file.split(/[\\/]/).at(-2);
	for (const error of fmErrors) errors.push(`${slug}: ${error}`);

	const html = body.match(HTML);
	if (html) errors.push(`${slug}: raw HTML (${html[0]}) — bodies are Markdown only`);

	if (data.form === "poem") {
		const lines = body
			.split(/\n{2,}/)
			.flatMap((stanza) => stanza.split("\n").filter((line) => line.trim()));
		if (lines.length < 4) errors.push(`${slug}: a poem needs at least 4 lines; found ${lines.length}`);
	}

	if (data.form === "stotram") {
		const verses = [...body.matchAll(/^##\s+Verse\s+(\d+)\s*$/gm)];
		if (!verses.length) errors.push(`${slug}: a stotram needs '## Verse 1'`);
		verses.forEach((match, index) => {
			if (Number(match[1]) !== index + 1) errors.push(`${slug}: verse numbering gap at ${match[1]}`);
		});
		const blocks = body.split(/^##\s+Verse\s+\d+\s*$/gm).slice(1);
		blocks.forEach((block, index) => {
			if (!/^\s*>/m.test(block)) errors.push(`${slug}: verse ${index + 1} needs a > blockquote`);
			if (!/\*\*Translation[.:]?\*\*/i.test(block)) errors.push(`${slug}: verse ${index + 1} needs **Translation.**`);
			if (!/\*\*Commentary[^*]*\*\*/i.test(block)) errors.push(`${slug}: verse ${index + 1} needs **Commentary.**`);
		});
	}

	if (["short", "long"].includes(data.form) && wordCount(body) < 40) {
		errors.push(`${slug}: ${wordCount(body)} words — a ${data.form} needs at least 40`);
	}
}

if (errors.length) {
	console.error(`✗ content body check — ${errors.length} problem${errors.length === 1 ? "" : "s"}`);
	for (const error of errors) console.error(`  ${error}`);
	process.exit(1);
}
console.log(`✓ content body check — ${files.length} posts`);
