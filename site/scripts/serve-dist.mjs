#!/usr/bin/env node
// serve-dist.mjs — static server for dist/, used by Playwright and for previews.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
const rootDir = resolve(process.cwd(), "dist");
const types = new Map([
	[".css", "text/css; charset=utf-8"],
	[".gif", "image/gif"],
	[".html", "text/html; charset=utf-8"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".js", "text/javascript; charset=utf-8"],
	[".json", "application/json; charset=utf-8"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".txt", "text/plain; charset=utf-8"],
	[".webp", "image/webp"],
	[".xml", "application/xml; charset=utf-8"],
	[".avif", "image/avif"],
]);

const toFile = async (pathname) => {
	const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
	const candidate = resolve(rootDir, `.${safe}`);
	if (!candidate.startsWith(rootDir)) return null;
	try {
		const info = await stat(candidate);
		return info.isDirectory() ? join(candidate, "index.html") : candidate;
	} catch {
		if (!extname(candidate)) return join(candidate, "index.html");
		return candidate;
	}
};

createServer(async (request, response) => {
	const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
	const file = await toFile(url.pathname === "/" ? "/index.html" : url.pathname);
	if (!file) {
		response.writeHead(403).end("Forbidden");
		return;
	}
	try {
		const body = await readFile(file);
		response.writeHead(200, {
			"content-length": body.byteLength,
			"content-type": types.get(extname(file)) || "application/octet-stream",
			"cache-control": "no-store",
		});
		response.end(body);
	} catch {
		response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
		response.end("Not Found");
	}
}).listen(port, "127.0.0.1", () => console.log(`Serving ${rootDir} at http://127.0.0.1:${port}`));
