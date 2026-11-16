export const stripHtml = (input: string) =>
	input
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, " ")
		.trim();

export const wordCount = (input: string) =>
	(
		stripHtml(input.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")).match(
			/[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F'’\-]*/g,
		) || []
	).length;

export const readingTime = (input: string, wpm = 225) => {
	const words = wordCount(input);
	return Math.max(0.4, Math.round((words / wpm) * 10) / 10);
};

export const readableDate = (date: Date) =>
	date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const shortDate = (date: Date) =>
	date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export const isoDate = (date: Date) => date.toISOString();

export const seoDescription = (value: string, max = 160) => {
	const text = stripHtml(value);
	if (text.length <= max) return text;
	const clipped = text.slice(0, max - 1);
	const lastSpace = clipped.lastIndexOf(" ");
	return `${clipped.slice(0, lastSpace > max * 0.6 ? lastSpace : max - 1).trim()}…`;
};
