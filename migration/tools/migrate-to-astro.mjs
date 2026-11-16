#!/usr/bin/env node
// migrate-to-astro.mjs — one-off Phase 2 normalizer.
//
// Reads the approved table from site-11ty/content/migration-report.md, converts the 31 non-blocked
// bodies with migration/tools/lib/convert.mjs, copies/normalizes each cover to 1600px JPEG, and writes
// site/src/content/posts/<slug>/index.md. The 32nd post is the holding page and is not a collection entry.
//
// It never writes site-11ty/src/posts. It prints a text-hash comparison for every post and exits 1 if a
// word, line break or IAST character would be lost.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { parseFrontMatter, serializeFrontMatter } from "../../site-11ty/scripts/lib/frontmatter.mjs";
import { stripHtml } from "../../site-11ty/scripts/lib/text.mjs";
import { convertPoem, convertProse, convertStotram } from "./lib/convert.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const OLD = join(ROOT, "site-11ty");
const SITE = join(ROOT, "site");
const POSTS = join(SITE, "src", "content", "posts");
const ASSETS = join(SITE, "src", "assets");
const require = createRequire(join(SITE, "package.json"));
const sharp = require("sharp");

const clean = (value) => value.replace(/`/g, "").replace(/^\*\*|\*\*$/g, "").trim();

const report = readFileSync(join(OLD, "content", "migration-report.md"), "utf8").split("\n");
const header = report.findIndex((line) => line.startsWith("| # | slug | title | form | deity | conf | excerpt |"));
const rows = [];
for (let i = header + 2; i < report.length && report[i].startsWith("|"); i++) {
	const cells = report[i].split("|").slice(1, -1).map((cell) => cell.trim());
	if (cells.length !== 7) continue;
	rows.push({
		slug: clean(cells[1]),
		form: clean(cells[3]),
		deities: clean(cells[4])
			.split("+")
			.map((value) => value.trim())
			.filter((value) => value && value !== "—"),
		excerpt: clean(cells[6]),
	});
}

const normalize = (value) =>
	value
		.replace(/\r\n/g, "\n")
		.replace(/\\\n/g, "\n")
		.replace(/^---$/gm, "")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^>\s?/gm, "")
		.replace(/^[*-]\s+/gm, "")
		.replace(/^\d+\.\s+/gm, "")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/\*/g, "")
		.replace(/\bTranslation\./g, "Translation")
		.replace(/\bCommentary\./g, "Commentary")
		.replace(/\s+/g, " ")
		.trim();

let failed = 0;
const migrated = [];
const holdings = [];

for (const row of rows) {
	const sourcePath = join(OLD, "src", "posts", `${row.slug}.md`);
	if (!existsSync(sourcePath)) {
		console.error(`MISSING SOURCE ${row.slug}`);
		failed++;
		continue;
	}
	if (row.form === "— (blocked)") {
		holdings.push(row.slug);
		continue;
	}

	const source = readFileSync(sourcePath, "utf8");
	const { data, body } = parseFrontMatter(source, row.slug);
	const converted =
		row.form === "poem"
			? convertPoem(body)
			: row.form === "stotram"
				? convertStotram(body)
				: convertProse(body);

	const wordsOf = (value) => (value.match(/[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F'’\-]*/g) || []).join(" ");
	const before = wordsOf(normalize(stripHtml(body)));
	const after = wordsOf(normalize(converted));
	const equal = before === after;
	if (!equal) {
		let i = 0;
		while (i < before.length && i < after.length && before[i] === after[i]) i++;
		console.error(
			`TEXT MISMATCH ${row.slug}\n  before: ${JSON.stringify(before.slice(Math.max(0, i - 60), i + 120))}\n  after:  ${JSON.stringify(after.slice(Math.max(0, i - 60), i + 120))}`,
		);
		failed++;
	}

	const dir = join(POSTS, row.slug);
	mkdirSync(dir, { recursive: true });

	let image;
	if (data.feature_image) {
		const sourceImage = join(OLD, "public", data.feature_image.replace(/^\//, ""));
		const target = join(dir, "cover.jpg");
		await sharp(sourceImage)
			.rotate()
			.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
			.flatten({ background: "#0B0C12" })
			.jpeg({ quality: 86, mozjpeg: true })
			.toFile(target);
		image = "./cover.jpg";
	}

	const frontMatter = {
		title: data.title,
		slug: row.slug,
		date: data.date,
		form: row.form,
		deity: row.deities.length ? row.deities : undefined,
		excerpt: row.excerpt,
		image,
		imageAlt: image ? data.title : undefined,
	};
	writeFileSync(join(dir, "index.md"), `${serializeFrontMatter(frontMatter)}\n${converted}`);
	migrated.push(row.slug);
	console.log(`OK ${row.slug}  ${before.length} chars  ${row.form}`);
}

// The blocked post is a holding page: convert its cover for the page, no collection entry.
if (holdings.length) {
	const sourceImage = join(OLD, "public", "images", "2025", "06", "kali-is-krishna-is-kali--35--1.png");
	await sharp(sourceImage)
		.rotate()
		.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
		.flatten({ background: "#0B0C12" })
		.jpeg({ quality: 86, mozjpeg: true })
		.toFile(join(ASSETS, "kali-is-krishna.jpg"));
}

console.log(`\nmigrated ${migrated.length}; holding ${holdings.join(", ") || "none"}; failures ${failed}`);
if (failed) process.exit(1);
