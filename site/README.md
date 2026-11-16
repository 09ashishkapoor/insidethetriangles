# Inside The Triangles — Astro 7

Direction 2 (The Yantra), static output, Cloudflare Workers static assets. Node 24 LTS target; the current
machine is on Node 26 and the build is tested there. One lockfile: this folder's `package-lock.json`.

The old Eleventy site in `../site-11ty/` is the rollback. Do not delete it until the Workers preview is
accepted.

## Commands

```bash
cd site
npm ci
npm run check          # astro check + body conventions (poems, stotrams, prose, no raw HTML)
npm run build           # cards (skips current) -> astro build -> URL/sitemap/feed check
npm run build:fast      # astro build only, for iterating on templates
npm run dev             # local dev server
npm run preview         # preview dist/
npm test                # URL parity, invalid post, smoke, a11y, links
npm run cards -- --force
npm run deploy          # npm run build && wrangler deploy
```

`npm run build` writes `dist/`: 36 page URLs (4 pages + 32 posts) plus `404.html`, `feed.xml`, `sitemap.xml`,
`llms.txt`, `robots.txt` and the opt-in `_headers`/`_redirects`; `wrangler deploy --dry-run` passes.
The 32 post URLs must stay exactly `/posts/<slug>/`; the URL parity test is the gate. Astro's Markdown
processor is Sätteri with `smartPunctuation: false`, because the archive contains both straight and curly
quotes and the text hash is exact.

## Content

One folder per post:

```
src/content/posts/<slug>/index.md
src/content/posts/<slug>/cover.jpg
```

The front matter is `title`, `date`, `form`, `deity`, `excerpt`, optional `image`/`imageAlt`; migrated entries
also carry `slug` (the frozen URL). New posts may omit `slug`; the folder name is the URL. `deity` is one key
or a list of at most two; `form` is one of the five vocabulary values. A site `update` may omit `deity` — the
approved `—` on “Just Getting Started” is the only such post.

The archive has 32 pieces: 31 collection entries plus the named holding page for the image-only post.
`/articles/` shows all 32; `/poems/` shows the 14 `form: poem` pieces.

Bodies:

- `poem` — one line per line, blank line between stanzas.
- `stotram` — `## Verse N`, a `>` blockquote of IAST lines, a `**Translation.**`/`**Translation:**` paragraph,
  a `**Commentary.**`/`**Commentary …**` paragraph. Numbered 1..n without gaps. The renderer strips a trailing
  period from `Translation.`/`Commentary.` for text parity; colons and “Commentary and Intricacies:” stay.
- `short`/`long`/`update` — plain Markdown.

`src/content/vocabulary.json` is the only source of `deity` and `form`; the content schema derives its enums
from it. During the transition it is a byte-identical copy of `../site-11ty/content/vocabulary.json`, kept so
the Pages rollback still builds. Edit both until cutover, then delete the old tree and this is the only copy.

## Images and cards

Post covers are co-located and normalized to max 1600px JPEG. Astro emits WebP derivatives for the archive
thumbnails. `scripts/cards.mjs` draws the 1200×630 OG card for each post into `public/images/og/<slug>.jpg`;
that folder is generated and gitignored. It skips cards newer than the post/cover and is the only step that
launches a browser. `npm run build` runs it before Astro; `npm run build:fast` does not.

## Tests

- `tests/url-parity.spec.ts` — 39 baseline URLs return 200; titles/canonicals/h1s match; each post's
  `[data-post-body]` text hash matches `../migration/url-parity.json`.
- `tests/invalid-post.spec.ts` — an unknown deity fails the build, using a temporary post and a temporary
  output directory.
- `tests/smoke.spec.ts` — home, archives, poem, stotram, holding page, feed/sitemap/llms.
- `tests/a11y.spec.ts` — axe serious/critical = 0 on eight pages.
- `tests/links.spec.ts` — internal links resolve.

**60/60 tests pass** locally. Playwright uses the installed Chrome channel, so `npx playwright install` is not
needed on this machine or on `windows-latest`. A Linux CI runner can switch to bundled `chromium` after
`npx playwright install chromium`.

## Cloudflare

**Live host: Cloudflare Pages**, project `insidethetriangles`, connected to GitHub `main`. The Pages build
configuration is:

| Setting | Value |
|---|---|
| Root directory | `site` |
| Build command | `npm ci && npm run build:ci` |
| Output directory | `dist` |
| Node version | `24` (`NODE_VERSION`) |

Every push to `main` builds and deploys production. Any other branch creates a Pages preview deployment;
`https://astro-7-preview.insidethetriangles.pages.dev` was the first Astro preview.

- **Manual production deploy:** `npm run deploy` — builds and uploads `dist/` directly to the Pages project.
  This is an escape hatch; Git pushes are the normal path.
- **Optional Workers path:** `npm run deploy:worker` deploys `wrangler.jsonc` as a `workers.dev` Worker with
  **no custom domain**. `npm run deploy:preview-worker` deploys the separate preview Worker
  `insidethetriangles-preview` (`https://insidethetriangles-preview.adyakaligeneral.workers.dev`).
- **Bundle check:** `npx wrangler deploy --dry-run`.

Rollback: roll back the Pages project to deployment `217acea0` (the last Eleventy production) or rebuild
`../site-11ty/`. There are no redirects; every existing URL is generated by its content entry.

## Deferred

- The Devanagari verse text is not in the archive; the stotram renderer ships IAST-only with no empty
  Devanagari element. The author supplies the Devanagari.
- The Tandava cover is the watermarked “Tryst With Kaali – Praveen Radhakrishnan” image. It is the post cover
  and the OG card; it needs permission, a replacement, or removal before launch.
- `/posts/kali-is-krishna-is-kali/` is a named holding page for the image-only post. Replace it when the author
  supplies a body or approves an image-only form.
- Matangi, Skanda/Karthikeya and Parvati/Durga are mapped to `adya`/`kali`/`bhairava` by the approved table;
  expand the vocabulary if the author wants first-class keys.
- No deity hub pages yet. The top-bar deity links are home anchors; adding `/kali/` etc. is a separate decision.
