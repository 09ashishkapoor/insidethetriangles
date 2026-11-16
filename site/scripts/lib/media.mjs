// media.mjs — image normalisation and share cards, both drawn by the Chrome you already have.
//
// No sharp, no ImageMagick: Playwright opens a throwaway page, draws the plate onto a canvas at
// 1600px, and returns a JPEG. The same browser renders the 1200×630 share card from the site's
// own type and colours, so a link looks like the site rather than like a screenshot of it.

import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);

export class MediaUnavailable extends Error {}

async function loadPlaywright() {
	for (const id of ["playwright", "@playwright/test", "playwright-core"]) {
		try {
			return require(id);
		} catch {
			/* try the next one */
		}
	}
	throw new MediaUnavailable(
		"Playwright is not installed, so images cannot be resized and share cards cannot be drawn.\n" +
			"  Fix: cd site-11ty && npm install && npx playwright install chromium\n" +
			"  Or:  pass --no-og to skip the card (an image still needs the browser to be resized — publish without one, or run npm install).",
	);
}

async function launch() {
	const { chromium } = await loadPlaywright();
	for (const options of [{ channel: "chrome" }, { channel: "msedge" }, {}]) {
		try {
			return await chromium.launch(options);
		} catch {
			/* try the next browser */
		}
	}
	throw new MediaUnavailable("No Chromium found. Run: npx playwright install chromium");
}

const NIGHT = "#0B0C12";

/** Resize to a web-ready JPEG. Returns { buffer, width, height }. */
export async function normaliseImage(file, { max = 1600, quality = 86 } = {}) {
	const source = readFileSync(file);
	const mime = /\.png$/i.test(file) ? "image/png" : /\.webp$/i.test(file) ? "image/webp" : "image/jpeg";
	const dataUrl = `data:${mime};base64,${source.toString("base64")}`;

	const browser = await launch();
	try {
		const page = await browser.newPage();
		await page.setContent("<body style='margin:0'></body>");
		const result = await page.evaluate(
			async ({ dataUrl, max, quality, background }) => {
				const img = new Image();
				img.src = dataUrl;
				await img.decode();
				const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
				const width = Math.round(img.naturalWidth * scale);
				const height = Math.round(img.naturalHeight * scale);
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				ctx.fillStyle = background; // flatten any transparency onto the site's night
				ctx.fillRect(0, 0, width, height);
				ctx.imageSmoothingQuality = "high";
				ctx.drawImage(img, 0, 0, width, height);
				const jpeg = canvas.toDataURL("image/jpeg", quality / 100);
				return { base64: jpeg.split(",")[1], width, height };
			},
			{ dataUrl, max, quality, background: NIGHT },
		);
		return { buffer: Buffer.from(result.base64, "base64"), width: result.width, height: result.height };
	} finally {
		await browser.close();
	}
}

const escape = (text) =>
	String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TRIKONA = `<svg viewBox="0 0 100 90" aria-hidden="true"><g fill="none" stroke="#C4922B" stroke-width="3"><path d="M3 4h94L50 85z"/><path d="M19 13h62L50 71z"/><path d="M33 22h34L50 58z"/></g><circle cx="50" cy="34" r="4" fill="#C4922B"/></svg>`;

function cardHtml({ title, deities, metaLeft, metaRight, plateDataUrl }) {
	const devanagari = deities.map((d) => d.dev).join("  ");
	const names = deities.map((d) => d.name).join(" · ");
	const titleSize = title.length > 74 ? 44 : title.length > 52 ? 50 : 56;
	return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..600;1,300..500&family=Schibsted+Grotesk:wght@400..600&family=JetBrains+Mono:wght@400;500&family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1200px;height:630px;overflow:hidden;background:${NIGHT};color:#E7E1D2;
    font-family:"Schibsted Grotesk",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .card{display:grid;grid-template-columns:${plateDataUrl ? "486px 1fr" : "1fr"};width:1200px;height:630px}
  .plate{position:relative;overflow:hidden;border-right:1px solid rgba(196,146,43,.32)}
  .plate img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9) contrast(1.03)}
  .plate::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 55%,rgba(11,12,18,.72))}
  .body{position:relative;padding:52px 56px 46px;display:flex;flex-direction:column}
  .deity{font-family:"Tiro Devanagari Hindi",serif;font-size:44px;line-height:1;color:#C33A28;margin-bottom:10px}
  .deity-name{font-family:"JetBrains Mono",monospace;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#C4922B}
  h1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:${titleSize}px;line-height:1.05;
    letter-spacing:.004em;margin-top:26px;text-wrap:balance}
  .rule{margin-top:auto;height:1px;background:rgba(196,146,43,.34);margin-bottom:18px}
  .foot{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
  .meta{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A8578;line-height:1.9}
  .site{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#E7E1D2}
  .mark{width:46px;height:42px}
  .mark svg{width:100%;height:100%}
  .ghost{position:absolute;right:-90px;bottom:-140px;width:460px;height:414px;opacity:.05}
</style></head>
<body><div class="card">
  ${plateDataUrl ? `<div class="plate"><img src="${plateDataUrl}" alt=""></div>` : ""}
  <div class="body">
    ${plateDataUrl ? "" : `<div class="ghost">${TRIKONA}</div>`}
    <div class="deity">${escape(devanagari)}</div>
    <div class="deity-name">${escape(names)}</div>
    <h1>${escape(title)}</h1>
    <div class="rule"></div>
    <div class="foot">
      <div class="meta">${escape(metaLeft)}<br>${escape(metaRight)}</div>
      <div class="mark">${TRIKONA}</div>
    </div>
    <div class="site" style="margin-top:14px">Inside The Triangles</div>
  </div>
</div></body></html>`;
}

/** Draw a 1200×630 share card. Returns { buffer, width, height }. */
export async function makeShareCard({
	title,
	deities,
	formName,
	dateLabel,
	readtime,
	plateFile,
	outputPath,
}) {
	let plateDataUrl = null;
	if (plateFile) {
		const ext = /\.png$/i.test(plateFile) ? "image/png" : /\.webp$/i.test(plateFile) ? "image/webp" : "image/jpeg";
		const bytes = readFileSync(plateFile);
		// keep the embedded plate small; the card is only 486px wide
		const normalised = bytes.length > 900_000 ? await normaliseImage(plateFile, { max: 1000, quality: 84 }) : bytes;
		plateDataUrl = `data:${ext};base64,${normalised.toString("base64")}`;
	}

	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
		await page.setContent(
			cardHtml({
				title,
				deities,
				metaLeft: `${formName} · ${dateLabel}`,
				metaRight: `${readtime} min read`,
				plateDataUrl,
			}),
			{ waitUntil: "load" },
		);
		await page.evaluate(async () => {
			if (document.fonts && document.fonts.ready) {
				await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3500))]);
			}
		});
		await page.waitForTimeout(250);
		const buffer = await page.screenshot({ type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1200, height: 630 } });
		mkdirSync(dirname(outputPath), { recursive: true });
		writeFileSync(outputPath, buffer);
		return { buffer, width: 1200, height: 630 };
	} finally {
		await browser.close();
	}
}
