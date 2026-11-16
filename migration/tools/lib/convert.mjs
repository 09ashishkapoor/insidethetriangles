// convert.mjs — the Phase 1 body rules, shared by the examples and the one-off Astro migration.
//
// The rules are documented in migration/examples/README.md and site-11ty/content/migration-report.md.
// This file only moves text between Ghost HTML and the contract's Markdown source; it never rewrites a
// word, a line break, an IAST character or an emphasis marker.

const BR = "\uE000";

export const decodeEntities = (value) =>
	value
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));

export const inline = (html) => {
	let text = String(html);
	text = text.replace(/<br\s*\/?>/gi, BR);
	text = text.replace(
		/<strong>\s*<em>(\s*)([\s\S]*?)\s*<\/em>\s*<\/strong>/gi,
		(_m, lead, content) => `${lead ? " " : ""}***${content}***`,
	);
	text = text.replace(
		/<em>\s*<strong>(\s*)([\s\S]*?)\s*<\/strong>\s*<\/em>/gi,
		(_m, lead, content) => `${lead ? " " : ""}***${content}***`,
	);
	text = text.replace(
		/<strong>(\s*)([\s\S]*?)(\s*)<\/strong>/gi,
		(_m, lead, content, trail) => `${lead ? " " : ""}**${content}**${trail ? " " : ""}`,
	);
	text = text.replace(
		/<em>(\s*)([\s\S]*?)(\s*)<\/em>/gi,
		(_m, lead, content, trail) => `${lead ? " " : ""}*${content}*${trail ? " " : ""}`,
	);
	text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
	text = text.replace(/<[^>]+>/g, "");
	// `<em>Agni Chakra,</em>your` is valid HTML but `*Agni Chakra,*your` is not emphasis in
	// CommonMark. Move the trailing punctuation outside the marker; the visible characters do not change.
	text = text.replace(/(\*{1,2}[^*\n]+?)([.,;:!?])(\*{1,2})(?=[A-Za-z0-9])/g, "$1$3$2");
	return decodeEntities(text);
};

export const hardBreaks = (text) =>
	text
		.split(BR)
		.map((line) => line.replace(/[ \t]+$/g, "").trim())
		.join("\\\n")
		// A <br> at the end of a paragraph has no visible effect; a literal backslash would.
		.replace(/\\\n\s*$/, "")
		.replace(/\\\s*$/, "")
		.trimEnd();

export const blocks = (body) => {
	const out = [];
	const re = /<(p|h2|h3|h4|ul|ol|blockquote)\b[^>]*>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>/gi;
	for (const match of body.matchAll(re)) {
		if (match[0].toLowerCase().startsWith("<hr")) out.push({ tag: "hr" });
		else out.push({ tag: match[1].toLowerCase(), inner: match[2] });
	}
	return out;
};

const list = (inner, ordered) => {
	const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(
		(m, index) => `${ordered ? `${index + 1}.` : "-"} ${hardBreaks(inline(m[1])).replace(/\n/g, "\n   ")}`,
	);
	return items.join("\n");
};

const quote = (inner) => {
	const paragraphs = [...inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
	const lines = (paragraphs.length ? paragraphs.flatMap((m) => inline(m[1]).split(BR)) : inline(inner).split(BR))
		.map((line) => line.trim())
		.filter(Boolean);
	return lines.map((line) => `> ${line}`).join("\n");
};

export const toMarkdown = (parsed, { dropHr = false } = {}) => {
	const out = [];
	for (let i = 0; i < parsed.length; i++) {
		const block = parsed[i];
		if (block.tag === "hr") {
			if (dropHr) continue;
			const previous = parsed[i - 1];
			const next = parsed[i + 1];
			if (!previous || !next) continue;
			if (next.tag.startsWith("h")) continue;
			out.push("---");
			continue;
		}
		if (block.tag === "p") out.push(hardBreaks(inline(block.inner)));
		else if (/^h[2-4]$/.test(block.tag)) {
			const text = inline(block.inner).trim();
			if (text) out.push(`${"#".repeat(Number(block.tag[1]))} ${text}`);
		}
		else if (block.tag === "ul") out.push(list(block.inner, false));
		else if (block.tag === "ol") out.push(list(block.inner, true));
		else if (block.tag === "blockquote") out.push(quote(block.inner));
	}
	return out.filter((part) => part.trim()).join("\n\n") + "\n";
};

export const convertPoem = (body) => {
	const stanzas = [];
	for (const block of blocks(body)) {
		if (block.tag !== "p") continue;
		const lines = inline(block.inner)
			.split(BR)
			.map((line) => line.trim())
			.filter(Boolean);
		if (lines.length) stanzas.push(lines.join("\n"));
	}
	return stanzas.join("\n\n") + "\n";
};

export const convertProse = (body) => toMarkdown(blocks(body));

const textOf = (block) => hardBreaks(inline(block.inner)).replace(/\*/g, "").trim();

// A label is a whole paragraph/heading whose text is Translation… or Commentary… only.
const labelOf = (block) => {
	if (block.tag !== "h3" && block.tag !== "p") return null;
	const text = textOf(block);
	if (!/^(Translation|Commentary)(\s+and\s+Intricacies)?:?$/i.test(text)) return null;
	return text;
};

const quoteLinesOf = (block) => {
	if (block.tag === "blockquote") {
		return [...block.inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
			.flatMap((m) => inline(m[1]).split(BR))
			.map((line) => line.trim())
			.filter(Boolean);
	}
	return inline(block.inner)
		.split(BR)
		.map((line) => line.trim())
		.filter(Boolean);
};

export const convertStotram = (body, stopAfterVerse = null) => {
	const sections = [];
	const matches = [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
	const preamble = body.slice(0, matches.length ? matches[0].index : body.length);
	if (preamble.trim()) sections.push({ title: null, inner: preamble });

	for (let i = 0; i < matches.length; i++) {
		const title = inline(matches[i][1]).replace(/\*/g, "").trim();
		const start = matches[i].index + matches[i][0].length;
		const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
		sections.push({ title, inner: body.slice(start, end) });
	}

	const out = [];
	for (const section of sections) {
		if (!section.title) {
			out.push(toMarkdown(blocks(section.inner), { dropHr: true }).trim());
			continue;
		}

		const verse = section.title.match(/^Verse\s+(\d+)\s*(?:\((.*)\))?\s*$/i);
		if (!verse) {
			out.push(`## ${section.title}\n\n${toMarkdown(blocks(section.inner), { dropHr: true }).trim()}`);
			continue;
		}
		if (stopAfterVerse !== null && Number(verse[1]) > stopAfterVerse) break;

		const parsed = blocks(section.inner).filter((block) => block.tag !== "hr");
		let quoteIndex = parsed.findIndex((block) => block.tag === "blockquote");
		let lead = [];
		let quoteBlock = null;
		let rest = [];

		if (quoteIndex >= 0) {
			lead = parsed.slice(0, quoteIndex);
			quoteBlock = parsed[quoteIndex];
			rest = parsed.slice(quoteIndex + 1);
		} else {
			// The Ashtakam stores the IAST as a <p> after a bold "Sanskrit:" label, not a blockquote.
			const sanskritIndex = parsed.findIndex(
				(block) => block.tag === "p" && /^Sanskrit\s*:/i.test(textOf(block)),
			);
			if (sanskritIndex >= 0) {
				lead = parsed.slice(0, sanskritIndex + 1);
				const iast = parsed[sanskritIndex + 1];
				if (iast && iast.tag === "p") {
					quoteBlock = iast;
					rest = parsed.slice(sanskritIndex + 2);
				} else {
					rest = parsed.slice(sanskritIndex + 1);
				}
			} else {
				rest = parsed;
			}
		}

		const translation = [];
		const commentary = [];
		const other = [];
		let mode = null;
		let translationLabel = null;
		let commentaryLabel = null;
		for (const block of rest) {
			const nextLabel = labelOf(block);
			if (nextLabel) {
				mode = /^Translation/i.test(nextLabel) ? "translation" : "commentary";
				if (mode === "translation" && !translationLabel) translationLabel = nextLabel;
				if (mode === "commentary" && !commentaryLabel) commentaryLabel = nextLabel;
				continue;
			}
			if (block.tag === "p") {
				const text = hardBreaks(inline(block.inner)).trim();
				if (!text) continue;
				if (mode === "translation") translation.push(text);
				else if (mode === "commentary") commentary.push(text);
				else other.push(text);
				continue;
			}
			other.push(toMarkdown([block], { dropHr: true }).trim());
		}

		const lines = [`## Verse ${verse[1]}`];
		if (verse[2]) lines.push("", `*(${verse[2]})*`);
		const leadText = toMarkdown(lead, { dropHr: true }).trim();
		if (leadText) lines.push("", leadText);
		const quoteLines = quoteBlock ? quoteLinesOf(quoteBlock) : [];
		if (quoteLines.length) lines.push("", quoteLines.map((line) => `> ${line}`).join("\n"));
		const withPeriod = (label) => (/^(Translation|Commentary)$/i.test(label) ? `${label}.` : label);
		if (translation.length) {
			lines.push("", `**${withPeriod(translationLabel ?? "Translation")}** ${translation[0]}`);
			for (const paragraph of translation.slice(1)) lines.push("", paragraph);
		}
		if (commentary.length) {
			lines.push("", `**${withPeriod(commentaryLabel ?? "Commentary")}** ${commentary[0]}`);
			for (const paragraph of commentary.slice(1)) lines.push("", paragraph);
		}
		for (const paragraph of other) lines.push("", paragraph);
		out.push(lines.join("\n"));
	}
	return out.join("\n\n") + "\n";
};
