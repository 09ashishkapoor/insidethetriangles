// text.mjs — small text helpers shared by the validator, the publisher and the audit.
// No dependencies on purpose: these run before anything is installed.

export const slugify = (input) =>
	(input || "")
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // strip diacritics: Tāṇḍava -> Tandava
		.replace(/['’"“”]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-")
		.slice(0, 80)
		.replace(/-+$/g, "");

export const stripHtml = (input) =>
	(input || "")
		.toString()
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, " ")
		.trim();

export const wordCount = (input) =>
	(
		stripHtml(String(input).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")).match(
			/[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F'’\-]*/g,
		) || []
	).length;

// Reading time in minutes, one decimal, floor of 0.4 so a two-line poem is not "0 min".
export const readingTime = (input, wpm = 225) => {
	const words = wordCount(input);
	return Math.max(0.4, Math.round((words / wpm) * 10) / 10);
};

export const clip = (input, max) => {
	const text = (input || "").toString().trim();
	if (text.length <= max) return text;
	const cut = text.slice(0, max - 1);
	const space = cut.lastIndexOf(" ");
	return `${cut.slice(0, space > max * 0.6 ? space : max - 1).trim()}…`;
};

export const isIsoDate = (value) => {
	if (typeof value !== "string") return false;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const d = new Date(`${value}T12:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};
