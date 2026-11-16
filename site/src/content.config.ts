import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import vocabulary from "../content/vocabulary.json";

const deity = z.enum(Object.keys(vocabulary.deities) as [string, ...string[]]);
const form = z.enum(Object.keys(vocabulary.forms) as [string, ...string[]]);

const posts = defineCollection({
	loader: glob({
		pattern: "*/index.md",
		base: "./src/content/posts",
		generateId: ({ entry }) => entry.replace(/\/index\.md$/, ""),
	}),
	schema: ({ image }) => z.object({
		title: z.string().min(4).max(90),
		// Migrated entries keep the existing slug; new entries omit it and use the folder name.
		slug: z
			.string()
			.regex(/^[a-z0-9-]+$/)
			.optional(),
		date: z.coerce.date(),
		form,
		deity: z
			.union([deity, z.array(deity).min(1).max(2)])
			.optional()
			.transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value])),
		excerpt: z.string().min(40).max(200),
		image: image().optional(),
		imageAlt: z.string().min(1).optional(),
	}).superRefine((data, ctx) => {
		// A site update may carry no deity (the approved `—` on "Just Getting Started").
		// Everything else must choose one; the build is the door.
		if (data.form !== "update" && data.deity.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["deity"],
				message: `deity is required for form "${data.form}"`,
			});
		}
	}),
});

export const collections = { posts };
