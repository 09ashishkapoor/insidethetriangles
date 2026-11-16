import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { deityName } from "./site";
import { readingTime } from "./text";

export type Post = CollectionEntry<"posts">;

export type ArchiveItem = {
	href: string;
	title: string;
	date: Date;
	form: string;
	deity: string[];
	image?: ImageMetadata;
	minutes: number;
};

export const slugOf = (post: Post) => post.data.slug ?? post.id;

export const byDateDesc = (a: Post, b: Post) => b.data.date.getTime() - a.data.date.getTime();

export const getPosts = async () => (await getCollection("posts")).sort(byDateDesc);

export const minutes = (post: Post) => readingTime(post.body ?? "");

export const toArchiveItem = (post: Post): ArchiveItem => ({
	href: `/posts/${slugOf(post)}/`,
	title: post.data.title,
	date: post.data.date,
	form: post.data.form,
	deity: post.data.deity.map(deityName),
	image: post.data.image,
	minutes: minutes(post),
});

// The one existing image-only post is a holding page, not a collection entry, but it is still a piece
// in the archive and the feed. See migration/next-agent-brief.md §4.1.
export const heldArchiveItem = (image: ImageMetadata): ArchiveItem => ({
	href: "/posts/kali-is-krishna-is-kali/",
	title: "Kali is Krishna is Kali",
	date: new Date("2025-06-01T19:43:57.000Z"),
	form: "—",
	deity: ["Kali"],
	image,
	minutes: 0.4,
});
