#!/usr/bin/env node
// convert-example.mjs — CLI over migration/tools/lib/convert.mjs.
//
//   node migration/tools/convert-example.mjs --post=the-serpents-heart --form=poem
//   node migration/tools/convert-example.mjs --post=the-alchemy-of-desire-transforming-physicality-into-spiritual-mastery --form=prose
//   node migration/tools/convert-example.mjs --post=shri-kali-tandava-stotram-translation-and-commentary --form=stotram --stop-after-verse=1
//
// The rules live in migration/tools/lib/convert.mjs and are documented in migration/examples/README.md.
// This script is read-only: it never writes site-11ty/src/posts or site/src/content.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseFrontMatter } from "../../site-11ty/scripts/lib/frontmatter.mjs";
import { SITE_ROOT } from "../../site-11ty/scripts/lib/schema.mjs";
import { convertPoem, convertProse, convertStotram } from "./lib/convert.mjs";

const flags = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [key, value = "true"] = arg.replace(/^--/, "").split("=");
		return [key, value];
	}),
);

const post = flags.post;
const form = flags.form;
if (!post || !form) {
	console.error("usage: --post=<slug> --form=poem|prose|stotram [--stop-after-verse=N]");
	process.exit(2);
}

const source = readFileSync(join(SITE_ROOT, "src", "posts", `${post}.md`), "utf8");
const { body } = parseFrontMatter(source, post);
const converted =
	form === "poem"
		? convertPoem(body)
		: form === "stotram"
			? convertStotram(body, flags["stop-after-verse"] ? Number(flags["stop-after-verse"]) : null)
			: convertProse(body);

console.log(converted);
