import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";

// Direction 2 — The Yantra. Static output; Cloudflare Workers static assets serves `dist/`.
// `trailingSlash: 'always'` + `build.format: 'directory'` is the only source of the trailing slash:
// every existing URL is /posts/<slug>/ and must stay that way.
export default defineConfig({
	site: "https://insidethetriangles.com",
	output: "static",
	trailingSlash: "always",
	build: { format: "directory" },
	compressHTML: true,
	// The archive contains both straight and curly quotes; the migration must not rewrite either.
	// Sätteri's smart punctuation would turn straight apostrophes into curly ones and change the text hash.
	markdown: { processor: satteri({ features: { smartPunctuation: false } }) },
});
