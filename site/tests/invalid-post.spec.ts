import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const dir = join(process.cwd(), "src", "content", "posts", "__invalid__");

test("a post with an invalid deity cannot build", () => {
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, "index.md"),
		`---
title: "Invalid post for the build gate"
slug: "__invalid__"
date: 2026-01-01
form: short
deity: [maa-kali]
excerpt: "This post exists only to prove that the build refuses an unknown deity."
---

A short body that would otherwise pass, with enough words to satisfy the prose minimum.
`,
	);

	try {
		const result = spawnSync(
			process.execPath,
			[join(process.cwd(), "node_modules", "astro", "bin", "astro.mjs"), "build", "--outDir", ".tmp-invalid-dist"],
			{ cwd: process.cwd(), encoding: "utf8", timeout: 120_000 },
		);
		const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`;
		expect(result.status, output).not.toBe(0);
		expect(output.toLowerCase()).toContain("deity");
	} finally {
		rmSync(dir, { recursive: true, force: true });
		rmSync(join(process.cwd(), ".tmp-invalid-dist"), { recursive: true, force: true });
	}
});
