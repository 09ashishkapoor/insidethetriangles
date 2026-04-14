import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
const rootDir = resolve(process.cwd(), "_site");

const contentTypes = new Map([
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
]);

const toFilePath = async (pathname) => {
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(rootDir, `.${safePath}`);

  if (!candidate.startsWith(rootDir)) {
    return null;
  }

  try {
    const candidateStat = await stat(candidate);
    if (candidateStat.isDirectory()) {
      return join(candidate, "index.html");
    }
    return candidate;
  } catch {
    if (!extname(candidate)) {
      return join(candidate, "index.html");
    }
    return candidate;
  }
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  const filePath = await toFilePath(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);

  if (!filePath) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = contentTypes.get(extname(filePath)) || "application/octet-stream";
    response.writeHead(200, {
      "content-length": body.byteLength,
      "content-type": contentType,
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${rootDir} at http://127.0.0.1:${port}`);
});
