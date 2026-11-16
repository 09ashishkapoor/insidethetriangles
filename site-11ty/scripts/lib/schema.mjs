// schema.mjs — the contract. One file, used by:
//   · scripts/publish.mjs      (a new draft must pass before it is written)
//   · scripts/content-check.mjs (the archive is audited against the same rules)
//   · scripts/render.mjs        (which knows what each form's body looks like)
//   · content/PUBLISHING.md     (documents this file; the error messages quote it)
//
// If a rule changes here it changes everywhere, including the error messages the agent reads back.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isIsoDate, readingTime, slugify, wordCount } from "./text.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = join(HERE, "..", "..");
export const VOCABULARY_PATH = join(SITE_ROOT, "content", "vocabulary.json");

export const loadVocabulary = (path = VOCABULARY_PATH) => JSON.parse(readFileSync(path, "utf8"));

const HTML_TAG = /<\/?(p|div|span|br|img|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|figure|figcaption|iframe|script|style|hr)\b[^>]*>/i;

export const findHtml = (body) => {
	const hit = body.match(HTML_TAG);
	return hit ? hit[0] : null;
};

// A draft is the author's (or the agent's) input. It is validated, then the computed fields are
// added by the publisher. Anything the agent writes that is computed is ignored with a warning.
const AUTHOR_FIELDS = new Set(["title", "deity", "date", "excerpt", "form", "image"]);
const COMPUTED_FIELDS = [
	"slug",
	"layout",
	"readtime",
	"words",
	"og_image",
	"image_width",
	"image_height",
	"feature_image",
	"card_image",
];

export const parseDeities = (value, vocabulary) => {
	const list = Array.isArray(value) ? value : value == null ? [] : [value];
	const known = Object.keys(vocabulary.deities);
	const clean = [];
	const unknown = [];
	for (const entry of list) {
		const key = String(entry).trim().toLowerCase();
		if (known.includes(key)) {
			if (!clean.includes(key)) clean.push(key);
		} else {
			unknown.push(String(entry));
		}
	}
	return { deities: clean, unknown };
};

/**
 * Validate a draft.
 * @param {{data: object, body: string, file?: string}} draft
 * @returns {{errors: Array<{field: string, message: string}>, warnings: Array<{field: string, message: string}>, computed: object}}
 */
export function validateDraft(draft, vocabulary, options = {}) {
	const limits = vocabulary.limits;
	const formList = Object.keys(vocabulary.forms);
	const deityList = Object.keys(vocabulary.deities);
	const errors = [];
	const warnings = [];
	const add = (field, message) => errors.push({ field, message });
	const warn = (field, message) => warnings.push({ field, message });

	const data = draft.data || {};
	const body = (draft.body || "").trim();

	// ── unknown / computed fields ────────────────────────────────────────
	for (const key of Object.keys(data)) {
		if (AUTHOR_FIELDS.has(key)) continue;
		if (COMPUTED_FIELDS.includes(key)) {
			warn(key, "computed by the publisher — remove it from the draft; the draft's value is ignored");
		} else {
			warn(key, `unknown field — allowed: ${[...AUTHOR_FIELDS].join(", ")}`);
		}
	}

	// ── title ────────────────────────────────────────────────────────────
	const title = (data.title || "").toString().trim();
	if (!title) add("title", "required");
	else if (title.length < limits.titleMin) add("title", `too short (${title.length}) — at least ${limits.titleMin} characters`);
	else if (title.length > limits.titleMax) add("title", `too long (${title.length}) — at most ${limits.titleMax} characters`);

	// ── deity ────────────────────────────────────────────────────────────
	const { deities, unknown } = parseDeities(data.deity, vocabulary);
	for (const bad of unknown) {
		add("deity", `"${bad}" is not in the vocabulary. Use one of: ${deityList.join(", ")}`);
	}
	if (deities.length === 0 && unknown.length === 0) add("deity", `required — one of: ${deityList.join(", ")}`);
	if (deities.length > limits.maxDeities) {
		add("deity", `at most ${limits.maxDeities} deities; got ${deities.length} (${deities.join(", ")})`);
	}

	// ── form ─────────────────────────────────────────────────────────────
	const form = (data.form || "").toString().trim().toLowerCase();
	if (!form) add("form", `required — one of: ${formList.join(", ")}`);
	else if (!formList.includes(form)) add("form", `"${data.form}" is not a form. Use one of: ${formList.join(", ")}`);

	// ── date ─────────────────────────────────────────────────────────────
	const date = (data.date || "").toString().trim();
	if (!date) add("date", "required — YYYY-MM-DD");
	else if (!isIsoDate(date)) add("date", `"${data.date}" is not a date. Use YYYY-MM-DD, e.g. 2026-11-14`);
	else {
		const today = new Date();
		const tomorrow = new Date(today.getTime() + 36 * 3600 * 1000);
		if (new Date(`${date}T12:00:00Z`) > tomorrow) add("date", `${date} is in the future`);
	}

	// ── excerpt ──────────────────────────────────────────────────────────
	const excerpt = (data.excerpt || "").toString().trim();
	if (!excerpt) add("excerpt", `required — ${limits.excerptMin}–${limits.excerptMax} characters, used on cards and in search results`);
	else if (excerpt.length < limits.excerptMin) add("excerpt", `too short (${excerpt.length}) — at least ${limits.excerptMin} characters`);
	else if (excerpt.length > limits.excerptMax) add("excerpt", `too long (${excerpt.length}) — at most ${limits.excerptMax} characters`);

	// ── image ────────────────────────────────────────────────────────────
	const image = data.image == null ? "" : String(data.image).trim();
	if (image && !/\.(jpe?g|png|webp|avif)$/i.test(image)) {
		add("image", `must be a jpg, png, webp or avif file — got "${image}"`);
	}

	// ── body ─────────────────────────────────────────────────────────────
	if (!body) add("body", "required");
	else {
		const html = findHtml(body);
		if (html) {
			add(
				"body",
				`raw HTML found (${html}). Bodies are Markdown only — no <p>, <br>, <div> or class attributes. ` +
					"For verse, put one line per line; for prose use Markdown.",
			);
		}
		const words = wordCount(body);
		if (form === "poem") {
			const stanzas = body.split(/\n{2,}/).filter((s) => s.trim());
			const lines = stanzas.flatMap((s) => s.split("\n").filter((l) => l.trim()));
			if (lines.length < limits.poemLinesMin) {
				add("body", `a poem needs at least ${limits.poemLinesMin} lines; found ${lines.length}`);
			}
			if (stanzas.some((s) => s.trim().split("\n").filter((l) => l.trim()).length === 1) && stanzas.length > 1) {
				warn("body", "a stanza of one line — check the blank lines between stanzas");
			}
		} else if (form === "stotram") {
			const verses = [...body.matchAll(/^##\s+Verse\s+(\d+)\s*$/gm)];
			if (verses.length === 0) {
				add("body", "a stotram needs at least one '## Verse 1' heading; none found");
			} else {
				const numbers = verses.map((m) => Number(m[1]));
				numbers.forEach((n, i) => {
					if (n !== i + 1) add("body", `verses must be numbered 1..n without gaps — found ${numbers.join(", ")}`);
				});
				const blocks = body.split(/^##\s+Verse\s+\d+\s*$/gm).slice(1);
				blocks.forEach((block, i) => {
					const n = i + 1;
					if (!/^\s*>/m.test(block)) add("verse " + n, "needs a > blockquote holding the transliteration");
					if (!/\*\*Translation[.:]?\*\*/i.test(block)) add("verse " + n, "needs a **Translation.** paragraph");
					if (!/\*\*Commentary[.:]?\*\*/i.test(block)) add("verse " + n, "needs a **Commentary.** paragraph");
				});
			}
		} else if (form && formList.includes(form) && form !== "update" && words < limits.bodyWordsMin) {
			add("body", `${words} words — a ${form} needs at least ${limits.bodyWordsMin}`);
		}
	}

	// ── slug ─────────────────────────────────────────────────────────────
	const slug = options.slug ? slugify(options.slug) : slugify(title);
	if (!slug) add("slug", "could not derive a slug from the title — pass --slug=<slug>");
	else if (slug.length < 3) add("slug", `"${slug}" is too short — pass --slug=<slug>`);

	const computed = {
		slug,
		date,
		form,
		deity: deities,
		readtime: readingTime(body, limits.wordsPerMinute),
		words: wordCount(body),
	};

	return { errors, warnings, computed };
}
