#!/usr/bin/env node
// publish.mjs — the door. One command, fail-closed.
//
//   npm run publish -- content/inbox/my-piece.md
//   npm run publish -- content/inbox/my-piece.md --dry        validate only, write nothing
//   npm run publish -- content/inbox/my-piece.md --no-og      skip the share card
//   npm run publish -- content/inbox/my-piece.md --slug=...   override the derived slug
//   npm run publish -- content/inbox/my-piece.md --commit     also make a local commit (never pushes)
//
// Exit code 0 only when the post was validated, written and built.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

import { parseFrontMatter, serializeFrontMatter } from "./lib/frontmatter.mjs";
import { renderBody } from "./lib/render.mjs";
import { SITE_ROOT, loadVocabulary, validateDraft } from "./lib/schema.mjs";
import { MediaUnavailable, makeShareCard, normaliseImage } from "./lib/media.mjs";

const POSTS_DIR = join(SITE_ROOT, "src", "posts");
const PUBLIC_IMAGES = join(SITE_ROOT, "public", "images");
const PUBLISHED_DIR = join(SITE_ROOT, "content", "published");
const RESERVED = new Set(["index", "poems", "articles", "about", "feed", "sitemap", "404", "posts"]);

const C = process.stdout.isTTY
	? { dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", gold: "\x1b[33m", bold: "\x1b[1m", off: "\x1b[0m" }
	: { dim: "", red: "", green: "", yellow: "", gold: "", bold: "", off: "" };

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const options = Object.fromEntries(
	args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split("=")),
);
const positionals = args.filter((a) => !a.startsWith("--"));
const draftPath = positionals[0];

if (!draftPath || flags.has("--help") || flags.has("-h")) {
	console.log(`Usage: npm run publish -- <draft.md> [--dry] [--no-og] [--slug=...] [--commit] [--keep] [--no-build]

The draft needs:
  title, deity, form, date, excerpt   (and optionally image)

Nothing is pushed to a remote. --commit makes a local commit and stops there.`);
	process.exit(draftPath ? 0 : 2);
}

const fail = (heading, details = []) => {
	console.error(`${C.red}✗${C.off} ${C.bold}${heading}${C.off}`);
	for (const line of details) console.error(`  ${line}`);
	process.exit(1);
};

const rel = (p) => relative(SITE_ROOT, p).replace(/\\/g, "/");
const publicPath = (url) => join(SITE_ROOT, "public", url.replace(/^\//, ""));
const vocabulary = loadVocabulary();
const deityKeys = Object.keys(vocabulary.deities);
const formKeys = Object.keys(vocabulary.forms);

// ── 1 · read and parse ──────────────────────────────────────────────────
const absoluteDraft = resolve(process.cwd(), draftPath);
if (!existsSync(absoluteDraft)) fail(`${draftPath} not found`, [`looked in ${absoluteDraft}`]);
const source = readFileSync(absoluteDraft, "utf8");
const parsed = parseFrontMatter(source, rel(absoluteDraft));
if (parsed.errors.length) {
	fail(`${rel(absoluteDraft)} — front matter could not be read`, parsed.errors);
}

// ── 2 · validate ────────────────────────────────────────────────────────
const { errors, warnings, computed } = validateDraft(parsed, vocabulary, { slug: options.slug });
for (const w of warnings) console.log(`${C.yellow}⚠${C.off}  ${w.field}: ${w.message}`);
if (errors.length) {
	fail(`${rel(absoluteDraft)} — ${errors.length} problem${errors.length === 1 ? "" : "s"}`, [
		...errors.map((e) => `${C.yellow}${e.field}:${C.off} ${e.message}`),
		"",
		`${C.dim}Vocabulary: deity = ${deityKeys.join(" | ")}   form = ${formKeys.join(" | ")}${C.off}`,
	]);
}

const { slug } = computed;
if (RESERVED.has(slug)) {
	fail(`slug "${slug}" collides with a page on the site`, [`Pick another with --slug=...`]);
}

// ── 3 · collisions ──────────────────────────────────────────────────────
const slugsFile = join(POSTS_DIR, ".published-slugs.txt");
const existing = new Set(
	(existsSync(slugsFile) ? readFileSync(slugsFile, "utf8") : "").split("\n").map((s) => s.trim()).filter(Boolean),
);
if (existing.has(slug) || existsSync(join(POSTS_DIR, `${slug}.md`))) {
	fail(`a post with slug "${slug}" already exists`, [
		`src/posts/${slug}.md is already taken.`,
		`If this is a revision, edit that file directly. If it is a new piece, pass --slug=...`,
	]);
}

// ── 4 · image ───────────────────────────────────────────────────────────
let plateFinal = null;
let plateSource = null;
if (parsed.data.image) {
	plateSource = resolve(dirname(absoluteDraft), String(parsed.data.image).trim());
	if (!existsSync(plateSource)) {
		fail(`image not found: ${parsed.data.image}`, [`resolved to ${rel(plateSource)}`, `paths are relative to the draft file`]);
	}
	const bytes = statSync(plateSource).size;
	if (bytes > vocabulary.limits.imageSourceMaxBytes) {
		fail(`image is too large to start from (${(bytes / 1048576).toFixed(1)} MB)`, [
			`limit is ${(vocabulary.limits.imageSourceMaxBytes / 1048576).toFixed(0)} MB — export a smaller source`,
		]);
	}
}

// ── 5 · render ──────────────────────────────────────────────────────────
const body = renderBody(parsed.data.form, parsed.body);
const [year, month] = computed.date.split("-");
const formMeta = vocabulary.forms[parsed.data.form];
const deities = computed.deity.map((key) => ({ key, ...vocabulary.deities[key] }));
const dateLabel = new Date(`${computed.date}T12:00:00Z`).toLocaleDateString("en-IN", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

const frontMatter = {
	title: parsed.data.title,
	slug,
	date: `${computed.date}T12:00:00.000Z`,
	layout: "post.liquid",
	excerpt: parsed.data.excerpt,
	deity: computed.deity,
	form: parsed.data.form,
	readtime: computed.readtime,
	words: computed.words,
	tags: [formMeta.tag],
};

const preview = `# ${parsed.data.title}
${deities.map((d) => d.name).join(" · ")} · ${formMeta.name} · ${dateLabel} · ${computed.readtime} min

${parsed.body.trim().slice(0, 150).replace(/\n/g, " / ")}…`;

if (flags.has("--dry")) {
	console.log(`\n${C.green}✓${C.off} ${C.bold}${parsed.data.title}${C.off} ${C.dim}(dry run — nothing written)${C.off}`);
	console.log(`  slug      ${slug}`);
	console.log(`  url       /posts/${slug}/`);
	console.log(`  deity     ${deities.map((d) => `${d.name} (${d.key})`).join(", ")}`);
	console.log(`  form      ${formMeta.name} → tag "${formMeta.tag}"`);
	console.log(`  date      ${dateLabel}`);
	console.log(`  length    ${computed.words} words · ${computed.readtime} min`);
	console.log(`  image     ${plateSource ? rel(plateSource) : "—"}`);
	console.log(`  card      ${flags.has("--no-og") ? "skipped (--no-og)" : `public/images/og/${slug}.jpg`}`);
	console.log(`\n${C.dim}${preview}${C.off}\n`);
	process.exit(0);
}

// ── 6 · media ───────────────────────────────────────────────────────────
try {
	if (plateSource) {
		const imageDir = join(PUBLIC_IMAGES, year, month);
		mkdirSync(imageDir, { recursive: true });
		const target = join(imageDir, `${slug}.jpg`);
		const { buffer, width, height } = await normaliseImage(plateSource);
		writeFileSync(target, buffer);
		plateFinal = { path: `/images/${year}/${month}/${slug}.jpg`, width, height, bytes: buffer.length };
		frontMatter.feature_image = plateFinal.path;
		frontMatter.image_width = plateFinal.width;
		frontMatter.image_height = plateFinal.height;
	}
	if (!flags.has("--no-og")) {
		const cardPath = join(PUBLIC_IMAGES, "og", `${slug}.jpg`);
		await makeShareCard({
			title: parsed.data.title,
			deities,
			formName: formMeta.name,
			dateLabel,
			readtime: computed.readtime,
			plateFile: plateFinal ? publicPath(plateFinal.path) : null,
			outputPath: cardPath,
		});
		frontMatter.og_image = `/images/og/${slug}.jpg`;
	}
} catch (error) {
	if (error instanceof MediaUnavailable) fail("media step cannot run", [error.message]);
	throw error;
}

// ── 7 · write ───────────────────────────────────────────────────────────
const outputPath = join(POSTS_DIR, `${slug}.md`);
writeFileSync(outputPath, `${serializeFrontMatter(frontMatter)}\n${body}`);

mkdirSync(PUBLISHED_DIR, { recursive: true });
if (!flags.has("--keep")) renameSync(absoluteDraft, join(PUBLISHED_DIR, basename(absoluteDraft)));

const slugs = new Set(existing);
slugs.add(slug);
writeFileSync(slugsFile, [...slugs].sort().join("\n") + "\n");

// ── 8 · build ───────────────────────────────────────────────────────────
let buildNote = "skipped (node_modules not installed — run npm install)";
if (!flags.has("--no-build") && existsSync(join(SITE_ROOT, "node_modules", "@11ty", "eleventy"))) {
	try {
		execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
			cwd: SITE_ROOT,
			stdio: "pipe",
		});
		buildNote = "ok";
	} catch (error) {
		fail("the site failed to build after publishing", [
			String(error.stderr || error.message).split("\n").slice(-12).join("\n"),
			`The post was written to ${rel(outputPath)} — fix the build, or delete the file to undo.`,
		]);
	}
}

// ── 9 · optional local commit (never a push) ────────────────────────────
let commitNote = "not committed (review, then commit yourself)";
if (flags.has("--commit")) {
	try {
		const files = [outputPath, ...(plateFinal ? [publicPath(plateFinal.path)] : [])];
		if (frontMatter.og_image) files.push(publicPath(frontMatter.og_image));
		execFileSync("git", ["add", ...files.map((f) => relative(SITE_ROOT, f))], { cwd: SITE_ROOT });
		execFileSync("git", ["commit", "-m", `post: ${parsed.data.title}`], { cwd: SITE_ROOT, stdio: "pipe" });
		commitNote = "committed locally — not pushed";
	} catch (error) {
		commitNote = `commit failed: ${String(error.stderr || error.message).split("\n")[0]}`;
	}
}

// ── 10 · report ─────────────────────────────────────────────────────────
console.log(`\n${C.green}✓${C.off} ${C.bold}${parsed.data.title}${C.off}`);
console.log(`  url      ${C.gold}/posts/${slug}/${C.off}`);
console.log(`  file     ${rel(outputPath)}`);
if (plateFinal) {
	console.log(`  image    ${plateFinal.path}  ${plateFinal.width}×${plateFinal.height}  ${(plateFinal.bytes / 1024).toFixed(0)} KB`);
}
if (frontMatter.og_image) console.log(`  card     ${frontMatter.og_image}`);
console.log(`  length   ${computed.words} words · ${computed.readtime} min`);
console.log(`  form     ${formMeta.name} · ${deities.map((d) => d.name).join(" · ")} · ${dateLabel}`);
console.log(`  build    ${buildNote}`);
console.log(`  git      ${commitNote}`);
console.log(`\n${C.dim}Preview: npm run dev${C.off}\n`);
