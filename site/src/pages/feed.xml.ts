import type { APIRoute } from "astro";
import { getPosts, slugOf } from "../lib/posts";
import { site } from "../lib/site";

const escapeXml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
	const posts = await getPosts();
	const entries = [
		...posts.map((post) => ({
			title: post.data.title,
			link: new URL(`/posts/${slugOf(post)}/`, site.url).href,
			date: post.data.date,
			description: post.data.excerpt,
		})),
		{
			// The existing image-only post is a holding page, not a collection entry.
			title: "Kali is Krishna is Kali",
			link: new URL("/posts/kali-is-krishna-is-kali/", site.url).href,
			date: new Date("2025-06-01T19:43:57.000Z"),
			description: "",
		},
	]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 20);

	const items = entries
		.map(
			(entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${entry.link}</link>
      <guid>${entry.link}</guid>
      <pubDate>${entry.date.toUTCString()}</pubDate>
      <description>${escapeXml(entry.description)}</description>
    </item>`,
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
