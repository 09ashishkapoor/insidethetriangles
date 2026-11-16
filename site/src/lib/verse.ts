// verse.ts — the contract source in, the Direction 2 verse HTML out.
//
// Two regimes, on purpose: poems and stotrams are rendered here because line breaks and verse structure
// are the content; prose is rendered by Astro's Markdown pipeline. The parser is also what the verse
// strip and the margin use, so the navigation cannot disagree with the body.

const escapeHtml = (text: string) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const inline = (text: string): string =>
	escapeHtml(text)
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => `<a href="${href}">${label}</a>`)
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
		.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");

const paragraphs = (text: string): string[] =>
	text
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

const paragraphHtml = (text: string, className = ""): string =>
	paragraphs(text)
		.map((paragraph) => {
			// A hard break is a backslash at the end of a line. Render it as <br>; never let the
			// backslash or the newline leak into the text. Each line is inline-rendered on its own so
			// `*Prayer…*\` is still emphasis, not a literal asterisk.
			const lines = paragraph.split("\n");
			const html = lines
				.map((line, index) => {
					const hard = /\\\s*$/.test(line);
					const text = hard ? line.replace(/\\\s*$/, "") : line;
					const rendered = inline(text);
					if (hard) return `${rendered}<br />`;
					return index === lines.length - 1 ? rendered : `${rendered} `;
				})
				.join("");
			return `<p${className ? ` class="${className}"` : ""}>${html}</p>`;
		})
		.join("\n");

export const renderPoem = (body: string): string => {
	const stanzas = body
		.replace(/\r\n/g, "\n")
		.split(/\n{2,}/)
		.map((stanza) =>
			stanza
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean),
		)
		.filter((lines) => lines.length > 0);
	const html = stanzas
		.map((lines) => `<p class="stanza">${lines.map((line) => inline(line)).join("<br />")}</p>`)
		.join("\n");
	return `<div class="verse">\n${html}\n</div>`;
};

export type Verse = {
	number: number;
	leadHtml: string;
	iastHtml: string;
	translationLabel: string;
	translationHtml: string;
	commentaryLabel: string;
	commentaryHtml: string;
	otherHtml: string;
};

export type Section = { title: string; html: string };
export type ParsedStotram = {
	introHtml: string;
	outroHtml: string;
	verses: Verse[];
	intro: boolean;
	outro: boolean;
};

const labelText = (label: string) => {
	// The contract marker may carry a period; the baseline page does not. Keep a colon (Ashtakam)
	// because that punctuation is part of the source text.
	if (/^(Translation|Commentary)\.$/i.test(label)) return label.slice(0, -1);
	return label;
};

const splitVerseContent = (content: string) => {
	const lines = content.replace(/\r\n/g, "\n").split("\n");
	const quoteStart = lines.findIndex((line) => /^\s*>/.test(line));
	if (quoteStart === -1) return { lead: "", iast: [], rest: content };
	let quoteEnd = quoteStart;
	while (quoteEnd + 1 < lines.length && /^\s*>/.test(lines[quoteEnd + 1])) quoteEnd++;
	return {
		lead: lines.slice(0, quoteStart).join("\n"),
		iast: lines.slice(quoteStart, quoteEnd + 1).map((line) => line.replace(/^\s*>\s?/, "")),
		rest: lines.slice(quoteEnd + 1).join("\n"),
	};
};

const parseVerse = (number: number, content: string): Verse => {
	const { lead, iast, rest } = splitVerseContent(content);
	const translation: string[] = [];
	const commentary: string[] = [];
	const other: string[] = [];
	let translationLabel = "Translation";
	let commentaryLabel = "Commentary";
	let mode: "translation" | "commentary" | null = null;

	for (const paragraph of paragraphs(rest)) {
		const label = paragraph.match(/^\*\*((?:Translation|Commentary)[^*]*?)\*\*\s*([\s\S]*)$/);
		if (label) {
			const clean = labelText(label[1].trim());
			if (/^Translation/i.test(clean)) {
				mode = "translation";
				translationLabel = clean;
			} else {
				mode = "commentary";
				commentaryLabel = clean;
			}
			if (label[2].trim()) {
				if (mode === "translation") translation.push(label[2]);
				else commentary.push(label[2]);
			}
			continue;
		}
		if (mode === "translation") translation.push(paragraph);
		else if (mode === "commentary") commentary.push(paragraph);
		else other.push(paragraph);
	}

	const leadHtml = paragraphHtml(lead, "sanskrit");
	const translationHtml = translation.map((paragraph) => `<p>${inline(paragraph.replace(/\n+/g, " "))}</p>`).join("\n");
	const commentaryHtml = commentary.map((paragraph) => `<p>${inline(paragraph.replace(/\n+/g, " "))}</p>`).join("\n");
	const otherHtml = other.map((paragraph) => `<p>${inline(paragraph.replace(/\n+/g, " "))}</p>`).join("\n");

	return {
		number,
		leadHtml,
		iastHtml: iast.map((line) => inline(line.trim())).join("<br />"),
		translationLabel,
		translationHtml,
		commentaryLabel,
		commentaryHtml,
		otherHtml,
	};
};

export const parseStotram = (body: string): ParsedStotram => {
	const parts = body.replace(/\r\n/g, "\n").split(/^##\s+(.+)$/gm);
	const preamble = (parts[0] || "").trim();
	const sections: Section[] = [];

	for (let i = 1; i < parts.length; i += 2) {
		sections.push({ title: parts[i].trim(), html: parts[i + 1] || "" });
	}

	let introHtml = preamble ? paragraphHtml(preamble) : "";
	let outroHtml = "";
	const verses: Verse[] = [];
	let seenVerse = false;

	for (const section of sections) {
		const verse = section.title.match(/^Verse\s+(\d+)$/);
		if (verse) {
			seenVerse = true;
			verses.push(parseVerse(Number(verse[1]), section.html));
			continue;
		}
		const html = `<h2>${inline(section.title)}</h2>\n${paragraphHtml(section.html)}`;
		if (seenVerse) outroHtml += `\n${html}`;
		else introHtml += `\n${html}`;
	}

	return {
		introHtml: introHtml.trim(),
		outroHtml: outroHtml.trim(),
		verses,
		intro: introHtml.trim().length > 0,
		outro: outroHtml.trim().length > 0,
	};
};

export const renderStotram = (body: string): string => {
	const parsed = parseStotram(body);
	const out: string[] = [];
	if (parsed.intro) out.push(`<div class="intro" id="intro">\n${parsed.introHtml}\n</div>`);

	for (const verse of parsed.verses) {
		out.push(`<section class="vu" id="v${verse.number}">
  <div class="axis" aria-hidden="true"><span class="vn" data-n="${verse.number}"></span></div>
  <div>
    <h2 class="sr-only">Verse ${verse.number}</h2>
    ${verse.leadHtml}
    <p class="iast">${verse.iastHtml}</p>
    ${verse.translationHtml ? `<div class="xl">\n<span class="lab">${escapeHtml(verse.translationLabel)}</span>\n${verse.translationHtml}\n</div>` : ""}
    ${verse.commentaryHtml ? `<div class="cm">\n<span class="lab">${escapeHtml(verse.commentaryLabel)}</span>\n${verse.commentaryHtml}\n</div>` : ""}
    ${verse.otherHtml}
  </div>
</section>`);
	}

	if (parsed.outro) out.push(`<div class="outro" id="outro">\n${parsed.outroHtml}\n</div>`);
	return out.join("\n");
};
