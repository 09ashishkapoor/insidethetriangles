import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { extname, resolve } from "node:path";

const siteRoot = process.cwd();
const repoRoot = resolve(siteRoot, "..");
const builtRoot = resolve(siteRoot, "_site");
const ignoreFile = resolve(repoRoot, ".lycheeignore");

const targets = [
  { path: resolve(repoRoot, "README.md"), type: "markdown" },
  { path: resolve(builtRoot, "index.html"), type: "html" },
  { path: resolve(builtRoot, "about", "index.html"), type: "html" },
  { path: resolve(builtRoot, "articles", "index.html"), type: "html" },
  { path: resolve(builtRoot, "poems", "index.html"), type: "html" },
];

const parseIgnorePatterns = async () => {
  try {
    const contents = await readFile(ignoreFile, "utf8");
    return contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => new RegExp(line));
  } catch {
    return [];
  }
};

const extractMarkdownUrls = (contents) => {
  const urls = [];
  const regex = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = regex.exec(contents)) !== null) {
    urls.push(match[1]);
  }

  return urls;
};

const extractHtmlUrls = (contents) => {
  const urls = [];
  const regex = /(?:href|src)=["']([^"']+)["']/g;
  let match;

  while ((match = regex.exec(contents)) !== null) {
    urls.push(match[1]);
  }

  return urls;
};

const fileExists = async (candidate) => {
  try {
    await access(candidate, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const resolveLocalCandidates = (url, sourcePath) => {
  const sourceDir = resolve(sourcePath, "..");
  const addIndexCandidate = (candidate) => {
    if (extname(candidate)) {
      return [candidate];
    }
    return [candidate, resolve(candidate, "index.html")];
  };

  if (url.startsWith("/")) {
    return addIndexCandidate(resolve(builtRoot, url.replace(/^\/+/, "")));
  }

  return addIndexCandidate(resolve(sourceDir, url));
};

const checkRemoteUrl = async (url) => {
  const attempt = async (method) => {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  };

  try {
    await attempt("HEAD");
  } catch {
    await attempt("GET");
  }
};

const ignorePatterns = await parseIgnorePatterns();
const failures = [];

for (const target of targets) {
  const contents = await readFile(target.path, "utf8");
  const urls = target.type === "markdown" ? extractMarkdownUrls(contents) : extractHtmlUrls(contents);

  for (const url of urls) {
    if (!url || url.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(url)) {
      continue;
    }

    if (ignorePatterns.some((pattern) => pattern.test(url))) {
      continue;
    }

    try {
      if (/^https?:\/\//i.test(url)) {
        await checkRemoteUrl(url);
        continue;
      }

      const candidates = resolveLocalCandidates(url, target.path);
      const exists = await Promise.any(
        candidates.map(async (candidate) => {
          if (await fileExists(candidate)) {
            return true;
          }
          throw new Error("missing");
        })
      ).catch(() => false);

      if (!exists) {
        throw new Error("missing local target");
      }
    } catch (error) {
      failures.push(`${target.path}: ${url} (${error.message})`);
    }
  }
}

if (failures.length > 0) {
  console.error("Link validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Link validation passed for ${targets.length} files.`);
