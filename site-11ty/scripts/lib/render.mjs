// render.mjs — draft body in, post body out.
//
// Two regimes, on purpose:
//   · verse forms (poem, stotram) are rendered here, precisely, because line breaks and stanza
//     structure are the content and no Markdown converter should be deciding them.
//   · prose forms pass through untouched so Eleventy's Markdown handles lists, links and headings.
//
// The validator has already refused raw HTML, so anything rendered from a draft is text we escaped.

const escapeHtml = (text) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Inline Markdown only: links, bold, italic. Text is escaped first.
const inline = (text) =>
	escapeHtml(text)
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => `<a href="${href}">${label}</a>`)
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
		.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");

const paragraphs = (block) =>
	block
		.split(/\n{2,}/)
		.map((p) => p.trim())
		.filter(Boolean);

export function renderPoem(body) {
	const stanzas = body
		.replace(/\r\n/g, "\n")
		.split(/\n{2,}/)
		.map((stanza) => stanza.split("\n").map((line) => line.trim()).filter(Boolean))
		.filter((lines) => lines.length > 0);
	const html = stanzas
		.map((lines) => `  <p class="stanza">${lines.map((line) => inline(line)).join("<br />")}</p>`)
		.join("\n");
	return `<div class="verse">\n${html}\n</div>\n`;
}

export function renderStotram(body) {
	const normalised = body.replace(/\r\n/g, "\n").trim();
	const parts = normalised.split(/^##\s+Verse\s+(\d+)\s*$/gm);
	const out = [];
	// parts: [preamble, "1", block, "2", block, …]
	const preamble = parts[0].trim();
	if (preamble) {
		for (const para of paragraphs(preamble)) out.push(`<p>${inline(para)}</p>`);
	}
	for (let i = 1; i < parts.length; i += 2) {
		const number = parts[i];
		const block = (parts[i + 1] || "").trim();
		const quoteLines = [];
		const rest = [];
		for (const rawLine of block.split("\n")) {
			const line = rawLine.trimEnd();
			if (/^\s*>/.test(line)) quoteLines.push(line.replace(/^\s*>\s?/, ""));
			else rest.push(line);
		}
		out.push(`<h2 id="verse-${number}">Verse ${number}</h2>`);
		const quote = quoteLines.map((line) => line.trim()).filter(Boolean);
		if (quote.length) {
			out.push(`<blockquote><p>${quote.map((line) => inline(line)).join("<br />")}</p></blockquote>`);
		}
		for (const para of paragraphs(rest.join("\n").trim())) {
			out.push(`<p>${inline(para.replace(/\n+/g, " "))}</p>`);
		}
	}
	return out.join("\n") + "\n";
}

export function renderBody(form, body) {
	if (form === "poem") return renderPoem(body);
	if (form === "stotram") return renderStotram(body);
	return body.trim() + "\n"; // short / long / update: Markdown, handled by Eleventy
}
