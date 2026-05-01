import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { IdAttributePlugin } from "@11ty/eleventy";

const normalizeWhitespace = (value) =>
	(value || "")
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

const seoDescription = (
	explicit,
	fallbackContent = "",
	siteDescription = "",
) => {
	const explicitText = normalizeWhitespace(explicit);
	const fallbackText = normalizeWhitespace(fallbackContent);
	const source =
		explicitText || fallbackText || normalizeWhitespace(siteDescription);

	if (source.length <= 160) return source;

	const clipped = source.slice(0, 157);
	const lastSpace = clipped.lastIndexOf(" ");
	return `${clipped.slice(0, lastSpace > 90 ? lastSpace : 157).trim()}…`;
};

const readImageDimensions = (absolutePath) => {
	if (!existsSync(absolutePath)) return null;

	const buffer = readFileSync(absolutePath);
	const extension = extname(absolutePath).toLowerCase();

	if (extension === ".png" && buffer.toString("ascii", 1, 4) === "PNG") {
		return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
	}

	if (
		[".jpg", ".jpeg"].includes(extension) &&
		buffer[0] === 0xff &&
		buffer[1] === 0xd8
	) {
		let offset = 2;
		while (offset < buffer.length) {
			if (buffer[offset] !== 0xff) break;
			const marker = buffer[offset + 1];
			const length = buffer.readUInt16BE(offset + 2);
			if (
				[
					0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
					0xce, 0xcf,
				].includes(marker)
			) {
				return {
					height: buffer.readUInt16BE(offset + 5),
					width: buffer.readUInt16BE(offset + 7),
				};
			}
			offset += 2 + length;
		}
	}

	return null;
};

export default function (eleventyConfig) {
	// Pass through static assets
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy({ public: "." });

	// Collections — filter by inputPath so they work regardless of CWD
	const isPost = (item) =>
		item.inputPath && item.inputPath.includes("/src/posts/");
	const hasTag = (item, tag) =>
		Array.isArray(item.data.tags) && item.data.tags.includes(tag);
	const byDateDesc = (a, b) => b.date - a.date;

	eleventyConfig.addCollection("allPosts", (api) =>
		api.getAll().filter(isPost).sort(byDateDesc),
	);
	eleventyConfig.addCollection("poems", (api) =>
		api
			.getAll()
			.filter((i) => isPost(i) && hasTag(i, "Poems"))
			.sort(byDateDesc),
	);
	eleventyConfig.addCollection("shortArticles", (api) =>
		api
			.getAll()
			.filter((i) => isPost(i) && hasTag(i, "short articles"))
			.sort(byDateDesc),
	);
	eleventyConfig.addCollection("longArticles", (api) =>
		api
			.getAll()
			.filter((i) => isPost(i) && hasTag(i, "long articles"))
			.sort(byDateDesc),
	);

	eleventyConfig.addFilter("truncate", (str, n) =>
		(str || "").toString().slice(0, n),
	);
	eleventyConfig.addFilter("json", (value) => JSON.stringify(value || ""));
	eleventyConfig.addFilter("seoDescription", seoDescription);
	eleventyConfig.addFilter("imageAttrs", (src) => {
		if (!src || !src.startsWith("/")) return "";
		const dimensions = readImageDimensions(
			join(process.cwd(), "public", src.replace(/^\/+/, "")),
		);
		return dimensions
			? `width="${dimensions.width}" height="${dimensions.height}"`
			: "";
	});

	// Limit filter
	eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

	// Date filter
	eleventyConfig.addFilter("readableDate", (dateObj) => {
		if (!dateObj) return "";
		const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
		return d.toLocaleDateString("en-IN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	});

	eleventyConfig.addFilter("isoDate", (dateObj) => {
		if (!dateObj) return "";
		const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
		return d.toISOString();
	});

	// Heading anchors — disable duplicate-id error since Ghost HTML may have them
	eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });

	return {
		dir: {
			input: "src",
			output: "_site",
			includes: "_includes",
			layouts: "_includes",
		},
		templateFormats: ["liquid", "md", "html"],
		markdownTemplateEngine: "liquid",
		htmlTemplateEngine: "liquid",
	};
}
