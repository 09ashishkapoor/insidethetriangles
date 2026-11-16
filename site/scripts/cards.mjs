#!/usr/bin/env node
// cards.mjs — draw the 1200×630 share cards before astro build.
// Skips cards that are newer than the post and its cover; --force redraws all.
// This is the only place a browser is launched. `astro build` never does.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { parseFrontMatter } from "./lib/frontmatter.mjs";
import { readingTime } from "./lib/text.mjs";
import { makeShareCard } from "./lib/media.mjs";

const SITE = join(import.meta.dirname, "..");
const POSTS = join(SITE, "src", "content", "posts");
const OUT = join(SITE, "public", "images", "og");
const vocabulary = JSON.parse(readFileSync(join(SITE, "content", "vocabulary.json"), "utf8"));
const force = process.argv.includes("--force");

const posts = readdirSync(POSTS, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => join(POSTS, entry.name, "index.md"))
	.filter((file) => existsSync(file));

let made = 0;
let skipped = 0;

for (const file of posts) {
	const { data, body } = parseFrontMatter(readFileSync(file, "utf8"), file);
	const slug = data.slug ?? file.split(/[\\/]/).at(-2);
	const cover = join(POSTS, slug, "cover.jpg");
	const card = join(OUT, `${slug}.jpg`);
	const inputs = [file, ...(existsSync(cover) ? [cover] : [])];
	const newestInput = Math.max(...inputs.map((input) => statSync(input).mtimeMs));
	if (!force && existsSync(card) && statSync(card).mtimeMs > newestInput) {
		skipped++;
		continue;
	}

	const deities = (Array.isArray(data.deity) ? data.deity : data.deity ? [data.deity] : []).map((key) => ({
		key,
		...vocabulary.deities[key],
	}));
	const date = new Date(`${String(data.date).slice(0, 10)}T12:00:00Z`);
	await makeShareCard({
		title: data.title,
		deities,
		formName: vocabulary.forms[data.form]?.name ?? data.form,
		dateLabel: date.toLocaleDateString("en-IN", {
			day: "numeric",
			month: "long",
			year: "numeric",
			timeZone: "UTC",
		}),
		readtime: readingTime(body, vocabulary.limits.wordsPerMinute),
		plateFile: existsSync(cover) ? cover : null,
		outputPath: card,
	});
	made++;
	console.log(`card ${slug}`);
}

console.log(`cards: ${made} drawn, ${skipped} current`);
