#!/usr/bin/env node
// content-check.mjs — audits the existing archive against the publishing contract.
//
//   npm run content:check            report, never fails
//   npm run content:check -- --strict   fail on anything the contract would reject (use in CI once migrated)
//   npm run content:check -- --report   also write content/migration-report.md
//
// This is the migration tool as much as the audit: it proposes a form and a deity for every post and
// says how confident it is, so the author confirms or corrects one list instead of 32 files.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { parseFrontMatter } from "./lib/frontmatter.mjs";
import { SITE_ROOT, findHtml, loadVocabulary, parseDeities } from "./lib/schema.mjs";
import { readingTime, stripHtml, wordCount } from "./lib/text.mjs";

const POSTS_DIR = join(SITE_ROOT, "src", "posts");
const vocabulary = loadVocabulary();
const flags = new Set(process.argv.slice(2));
const strict = flags.has("--strict");
const writeReport = flags.has("--report");

const C = process.stdout.isTTY
	? { dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", bold: "\x1b[1m", off: "\x1b[0m" }
	: { dim: "", red: "", green: "", yellow: "", bold: "", off: "" };

const FORM_FROM_TAG = {
	Poems: "poem",
	"short articles": "short",
	"long articles": "long",
	updates: "update",
};

const DEITY_PATTERNS = {
	kali: /\b(kali|kālī|kalika|tandava|dakshina|dakṣiṇa|shyama|śyāmā|mahavidya|mahāvidyā)\b/gi,
	adya: /\b(adya|adyā|primordial mother|mahakali|mahākālī|originless)\b/gi,
	bhairava: /\b(bhairava|kala ?bhairava|kāla ?bhairava|kanda ?bhairava|kaṇḍa ?bhairava|cand ?bhairava|khyapa|kṣetrapāla|kshetrapala)\b/gi,
	mahakala: /\b(mahakala|mahākāla)\b/gi,
};

const proposeDeities = (text) => {
	const scores = Object.entries(DEITY_PATTERNS).map(([key, re]) => [key, (text.match(re) || []).length]);
	scores.sort((a, b) => b[1] - a[1]);
	const top = scores[0];
	const second = scores[1];
	const picks = [];
	if (top[1] > 0) picks.push(top[0]);
	if (second[1] >= 2 && second[1] >= top[1] * 0.5) picks.push(second[0]);
	const confident = top[1] >= 3;
	return { picks, confident, scores: Object.fromEntries(scores) };
};

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort();
const rows = [];
let totals = { posts: 0, words: 0, noForm: 0, noDeity: 0, htmlVerse: 0, heavyImage: 0, noExcerpt: 0 };

for (const file of files) {
	const path = join(POSTS_DIR, file);
	const source = readFileSync(path, "utf8");
	const { data, body } = parseFrontMatter(source, file);
	const slug = file.replace(/\.md$/, "");
	const plain = stripHtml(body);
	const words = wordCount(body);

	const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
	const formFromField = data.form && vocabulary.forms[data.form] ? data.form : null;
	const formDerived = tags.map((t) => FORM_FROM_TAG[t]).find(Boolean) || null;
	const isStotram = /^##\s+Verse\s+\d+/m.test(body) || /<h2[^>]*>\s*Verse\s+\d+/i.test(body);
	const form = formFromField || (isStotram ? "stotram" : formDerived);

	const declared = parseDeities(data.deity, vocabulary);
	const proposal = proposeDeities(`${data.title || ""} ${plain}`);
	const deities = declared.deities.length ? declared.deities : proposal.picks;
	const deityConfirmed = declared.deities.length > 0;

	const issues = [];
	if (!form) issues.push({ key: "noForm", text: "no form — tags missing or unknown" });
	if (!deityConfirmed) {
		issues.push({
			key: "noDeity",
			text: deities.length
				? `deity proposed: ${deities.join(" + ")}${proposal.confident ? "" : " (low confidence)"}`
				: "deity could not be proposed",
		});
	}
	const html = findHtml(body);
	if (html && (form === "poem" || form === "stotram")) {
		issues.push({ key: "htmlVerse", text: `verse stored as HTML (${html})` });
	}
	if (!data.excerpt) issues.push({ key: "noExcerpt", text: "no excerpt" });
	if (data.feature_image && statSync(join(SITE_ROOT, "public", data.feature_image.replace(/^\//, ""))).size > 1_048_576) {
		const mb = (statSync(join(SITE_ROOT, "public", data.feature_image.replace(/^\//, ""))).size / 1048576).toFixed(1);
		issues.push({ key: "heavyImage", text: `image ${mb} MB` });
	}

	for (const issue of issues) {
		if (issue.key === "noForm") totals.noForm++;
		if (issue.key === "noDeity") totals.noDeity++;
		if (issue.key === "htmlVerse") totals.htmlVerse++;
		if (issue.key === "heavyImage") totals.heavyImage++;
		if (issue.key === "noExcerpt") totals.noExcerpt++;
	}
	totals.posts++;
	totals.words += words;

	rows.push({
		slug,
		title: data.title || "(no title)",
		date: (data.date || "").slice(0, 10),
		form,
		deities,
		confident: proposal.confident,
		words,
		minutes: readingTime(body, vocabulary.limits.wordsPerMinute),
		issues,
	});
}

// ── table ────────────────────────────────────────────────────────────────
const pad = (text, width) => String(text).padEnd(width).slice(0, width);
const cut = (text, width) => (String(text).length > width ? `${String(text).slice(0, width - 1)}…` : String(text));
console.log(`\n${C.bold}content-check${C.off} ${C.dim}— ${totals.posts} posts in src/posts${C.off}\n`);
console.log(`${C.dim}${pad("slug", 44)} ${pad("form", 8)} ${pad("deity", 16)} ${pad("min", 5)} issues${C.off}`);
for (const row of rows) {
	const flag = row.issues.length ? C.yellow : C.green;
	console.log(
		`${flag}${row.issues.length ? "·" : "✓"}${C.off} ${pad(cut(row.slug, 42), 42)} ${pad(row.form || "—", 8)} ${pad(
			cut(row.deities.join("+") || "—", 14),
			16,
		)} ${pad(row.minutes, 5)} ${C.dim}${row.issues.map((i) => i.text).join("; ")}${C.off}`,
	);
}

// ── summary ──────────────────────────────────────────────────────────────
const pct = (n) => `${n} (${Math.round((n / totals.posts) * 100)}%)`;
console.log(`\n${C.bold}summary${C.off}`);
console.log(`  posts                 ${totals.posts}`);
console.log(`  words                 ${totals.words.toLocaleString()}`);
console.log(`  no form (invisible)   ${C.yellow}${pct(totals.noForm)}${C.off}`);
console.log(`  no declared deity     ${C.yellow}${pct(totals.noDeity)}${C.off}`);
console.log(`  verse stored as HTML  ${C.yellow}${pct(totals.htmlVerse)}${C.off}`);
console.log(`  images over 1 MB      ${C.yellow}${pct(totals.heavyImage)}${C.off}`);
console.log(`  no excerpt            ${C.yellow}${pct(totals.noExcerpt)}${C.off}`);

if (writeReport) {
	const lines = [
		"# Migration report",
		"",
		"Generated by `npm run content:check -- --report`. Every proposal below is a guess made from the text;",
		"the author confirms or corrects it. Order is worst first — the posts with the most missing.",
		"",
		"| post | proposed form | proposed deity | confidence | issues |",
		"|---|---|---|---|---|",
		...rows
			.slice()
			.sort((a, b) => b.issues.length - a.issues.length)
			.map(
				(r) =>
					`| ${r.title.replace(/\|/g, "\\|")} | ${r.form || "**?**"} | ${r.deities.join(" + ") || "**?**"} | ${
						r.confident ? "ok" : "check"
					} | ${r.issues.map((i) => i.text).join("; ")} |`,
			),
	];
	writeFileSync(join(SITE_ROOT, "content", "migration-report.md"), lines.join("\n") + "\n");
	console.log(`\n${C.dim}wrote content/migration-report.md${C.off}`);
}

const blocking = rows.filter((r) => r.issues.some((i) => i.key === "noForm")).length;
if (strict && blocking > 0) {
	console.error(`\n${C.red}✗${C.off} ${blocking} posts have no form and would be invisible to the archive.`);
	process.exit(1);
}
console.log(`\n${C.dim}${strict ? "strict mode" : "report only — nothing changed"}${C.off}\n`);
