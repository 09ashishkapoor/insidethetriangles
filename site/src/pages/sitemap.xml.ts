import type { APIRoute } from "astro";
import { getPosts, slugOf } from "../lib/posts";
import { site } from "../lib/site";

export const GET: APIRoute = async () => {
	const posts = await getPosts();
	const entries = [
		{ loc: "/", changefreq: "daily", priority: "1.0", lastmod: null },
		{ loc: "/about/", changefreq: "monthly", priority: "0.7", lastmod: null },
		{ loc: "/poems/", changefreq: "weekly", priority: "0.8", lastmod: null },
		{ loc: "/articles/", changefreq: "weekly", priority: "0.8", lastmod: null },
		...posts.map((post) => ({
			loc: `/posts/${slugOf(post)}/`,
			changefreq: "monthly",
			priority: "0.6",
			lastmod: post.data.date.toISOString().slice(0, 10),
		})),
		{
			loc: "/posts/kali-is-krishna-is-kali/",
			changefreq: "monthly",
			priority: "0.6",
			lastmod: "2025-06-01",
		},
	].sort((a, b) => {
		// Keep the four page entries first, then the posts newest first, matching the old sitemap.
		const pageOrder = ["/", "/about/", "/poems/", "/articles/"];
		const ai = pageOrder.indexOf(a.loc);
		const bi = pageOrder.indexOf(b.loc);
		if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
		return String(b.lastmod).localeCompare(String(a.lastmod));
	});

	const urls = entries
		.map(
			(entry) => `  <url>
    <loc>${site.url}${entry.loc}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
