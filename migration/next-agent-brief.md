# Phase 2 brief — Astro 7 port of Direction 2

**Read this with:** [`direction-approved.md`](../direction-approved.md),
[`design-demos/dir-2.html`](../design-demos/dir-2.html),
[`design-demos/dir-2-post.html`](../design-demos/dir-2-post.html),
[`design-demos/dir-2.css`](../design-demos/dir-2.css),
[`site-11ty/content/migration-report.md`](../site-11ty/content/migration-report.md),
[`migration/content-audit.md`](content-audit.md), and [`migration/url-parity.json`](url-parity.json).

**Do not start until the 32-row form/deity/excerpt table is approved.** Phase 2 moves the site to Astro 7.x,
static output, as the vehicle for the approved Direction 2 (The Yantra) design. It does not redesign the
design, does not add a CMS, and does not change a URL or a word of post text.

## Implementation status — 2026-11-15

The first Phase 2 pass is in the tree at `site/`; the plan below is still the acceptance contract, with these
recorded deviations:

- **Astro 7.4.12**, Node 26.13.1 (target Node 24), npm, one `site/package-lock.json`.
- **Actual layout:** one `src/styles/design.css` copied from `design-demos/dir-2.css` plus a small
  `src/styles/site.css`; `src/lib/verse.ts` (TypeScript, not `.mjs`); `src/pages/feed.xml.ts` and
  `sitemap.xml.ts`; `scripts/cards.mjs`, `validate-content.mjs`, `check-output.mjs`, `serve-dist.mjs`;
  `tests/*.spec.ts`; `playwright.config.ts`. The demo stylesheet was not split into four files on the first pass
  because fidelity mattered more; split it only when it needs to change.
- **Schema:** `schema: ({ image }) => z.object({…})` (the Astro 7 `image()` is the schema callback, not an
  import); `slug` is optional and must equal `entry.id` when present; `deity` is optional only for `form:
  update` and is enforced by `superRefine` for every other form. `render(post)` from `astro:content` replaces
  `post.render()`.
- **URLs:** 36 sitemap URLs; 32 posts; 39 baseline files including feed/sitemap/llms. The build emits 37 HTML
  files (36 URL pages + `404.html`). The holding page is included in `/articles/` (32 cards), the home count,
  the feed (20 items) and the sitemap; it is not a collection entry and has no deity/form.
- **Home h1:** the h1 stays “Inside The Triangles” to match the URL snapshot; the demo’s “The single,
  ultimate reality…” is the `.hero-quote` paragraph. The design reads the same; the h1 contract is exact.
- **Top bar:** the four deity labels link to the home gate anchors (`/#gate-kali`, …), not new hub pages. No
  new URL surface. Deity hubs are a separate decision.
- **Tests:** URL parity extracts `[data-post-body]` and hashes the same strip-tags text as the baseline;
  Playwright uses `channel: "chrome"` (no browser download). `@types/node` is installed for the tests.
- **Build:** `npm run build` runs `cards.mjs` (skips current cards), `astro build`, `check-output.mjs`;
  `build:fast` skips cards. `npm run check` is `astro check` + body conventions.
- **Markdown:** Sätteri with `features.smartPunctuation: false`; Astro's default smart punctuation would
  rewrite straight quotes and break the text hash. The config uses the processor API, not the deprecated
  `markdown.smartypants`.
- **Hosting changed during cutover.** The existing Git-linked **Cloudflare Pages** project was adjusted to
  root `site`, build `npm ci && npm run build:ci`, output `dist`, Node 24, and the `main` push deployed it to
  `insidethetriangles.com`. Workers is now optional (`npm run deploy:worker`, no custom domain). The approved
  Workers-hosting decision in §1 is superseded for the initial cutover.
- **Status:** `npm run check` passes (32 posts); `npm run build` passes (cards + Astro + output check);
  **60/60 Playwright tests pass** (39 URL parity, invalid-post, 6 smoke, 8 a11y, 6 links); Pages production
  deployment `1df1061b` is live on the domain; the Git-built Pages preview passed. Remaining: author-only
  items (Devanagari, Tandava watermark permission, image-only post) and optional Workers cleanup.

## 1 · Decisions already fixed

- **Astro 7.x**, `output: 'static'`, no adapter. Cloudflare Workers static assets is the host.
- **Node 24 LTS**, npm, **one lockfile**. The old site stays on `site-11ty/` until cutover; the new site lives in
  `site/`. Do not build both from one lockfile.
- **Cloudflare Pages remains the rollback** until the Workers preview is accepted. Do not delete the Pages
  project or the old workflow in Phase 2.
- **Content is Markdown in git.** No CMS, no Next/SvelteKit/Hugo, no MDX.
- **All 32 existing URLs survive exactly.** `slug` is the entry ID and the route key; the file name must agree.
- **`vocabulary.json` is the one source of truth** for `deity` and `form`. Move it with the site; never fork it.
- **The design is approved.** Port `dir-2` and `dir-2-post`; do not restyle, rename the concept, or reintroduce
  the square/lotus/circle. The yantra is three nested down-pointing triangles and a bindu.

## 2 · Target file layout

```
site/
  astro.config.mjs
  package.json
  package-lock.json
  tsconfig.json
  wrangler.jsonc
  content/
    vocabulary.json              # moved from site-11ty/content/vocabulary.json, unchanged
  public/
    llms.txt
    robots.txt
    _headers
    _redirects                   # empty unless a legacy redirect is approved
    images/og/<slug>.jpg         # pre-built share cards (generated, not hand-edited)
  scripts/
    cards.mjs                    # Playwright pre-build, copy of site-11ty/scripts/lib/media.mjs
    lib/media.mjs                # copied once; do not import across the two site trees
    validate-content.mjs         # same schema as content.config.ts
    check-output.mjs             # URL parity + feed/sitemap counts
    serve-dist.mjs               # static server for tests
  src/
    content.config.ts
    content/posts/<slug>/index.md
    content/posts/<slug>/cover.jpg
    components/
      Yantra.astro               # the trikona + bindu, from dir-2
      SiteBar.astro
      PostCard.astro
      VerseStrip.astro
      VerseBlock.astro           # stotram section: axis, IAST, translation, commentary
      Prose.astro
    layouts/
      Base.astro                 # head, SEO, JSON-LD, feed link, bar, footer
      Post.astro                 # article head + feature image + body
      Archive.astro              # /poems/ and /articles/
    lib/
      verse.mjs                  # port/extend scripts/lib/render.mjs
      reading-time.mjs
      seo.mjs
      images.mjs
    pages/
      index.astro
      about.astro
      poems.astro
      articles.astro
      posts/[slug].astro
      feed.xml.ts
      sitemap.xml.ts
      404.astro
    styles/
      tokens.css                 # from dir-2.css, no new colours
      base.css
      layout.css
      components.css
  tests/
    url-parity.spec.ts
    invalid-post.spec.ts
    smoke.spec.ts
    a11y.spec.ts
    links.spec.ts
```

The per-post folder is deliberate: it lets a post carry `cover.jpg` and, later, more plates without a naming
scheme. If the glob loader's ID convention makes `index.md` awkward, the fallback is flat
`src/content/posts/<slug>.md` + `src/content/posts/<slug>.cover.jpg`; the acceptance criterion is
`entry.id === slug`, not the folder shape.

## 3 · `src/content.config.ts` shape

Astro 7 content layer, `glob()` loader, Zod from `astro/zod`, enums from `vocabulary.json`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import vocabulary from '../content/vocabulary.json';

const deity = z.enum(Object.keys(vocabulary.deities) as [string, ...string[]]);
const form = z.enum(Object.keys(vocabulary.forms) as [string, ...string[]]);

const posts = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/posts',
    // Must yield the URL slug, not "<slug>/index".
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) => z.object({
    title: z.string().min(4).max(90),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(), // migrated entries only; must equal entry.id
    date: z.coerce.date(),                        // preserve the existing ISO timestamp
    form,
    deity: z
      .union([deity, z.array(deity).min(1).max(2)])
      .optional()
      .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v])),
    excerpt: z.string().min(40).max(200),
    image: image().optional(),                    // ./cover.jpg, relative to the entry
    imageAlt: z.string().min(1).optional(),
  }).superRefine((data, ctx) => {
    // The approved `—` on "Just Getting Started" is the only no-deity post; it is an update.
    if (data.form !== 'update' && data.deity.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['deity'], message: `deity is required for form "${data.form}"` });
    }
  }),
});

export const collections = { posts };
```

Rules the config must enforce, because the build is the door:

- `deity` and `form` are the **vocabulary enums**, not strings. A typo fails the build.
- `deity` accepts one key or a list of at most two; normalize to an array in the schema.
- `excerpt` is 40–200 characters. This is the contract; do not loosen it to get the archive through.
- `date` is a date; preserve the existing timestamps for the 31 convertible posts. New drafts may use
  `YYYY-MM-DD`; the publisher may write `T12:00:00.000Z`.
- `image` uses `image()`, so width/height are known at build time and `<Image>` gets them for free.
- `slug` is **optional**. The 32 migrated entries keep the existing `slug` front matter; it must equal
  `entry.id`. New posts omit it and use the file name (the publisher computes the slug and names the folder).
  Add a build-time assertion in `getStaticPaths`:
  ```ts
  const slug = entry.data.slug ?? entry.id;
  if (entry.data.slug && entry.data.slug !== entry.id) {
    throw new Error(`${entry.id}: slug front matter is "${entry.data.slug}" — the URL would change`);
  }
  ```
  Astro 7 may use the `slug` front matter as the ID override. Either way, the assertion is the parity gate for
  migrated content, and new content never needs to hand-write a slug.
- Do not add `layout`, `tags`, `readtime`, `words`, `og_image`, `image_width`, `image_height` as authored
  fields. They are computed: reading time from the body at 225 wpm; the tag from `form`; dimensions from
  `image()`; the card path from the slug.

## 4 · Routes and URL preservation

- `src/pages/posts/[slug].astro`:
  ```ts
  export async function getStaticPaths() {
    const posts = await getCollection('posts');
    return posts.map((entry) => {
      const slug = entry.data.slug ?? entry.id;
      if (entry.data.slug && entry.data.slug !== entry.id) throw new Error(`${entry.id}: slug mismatch`);
      return { params: { slug }, props: { entry } };
    });
  }
  ```
- `astro.config.mjs`: `site: 'https://insidethetriangles.com'`, `output: 'static'`,
  `trailingSlash: 'always'`, `build: { format: 'directory' }`. Output must be
  `dist/posts/<slug>/index.html`, so `/posts/<slug>/` and `/posts/<slug>` both resolve under Cloudflare's
  `force-trailing-slash` handling.
- The four non-post URLs keep their templates: `/` (`index.astro`), `/about/` (`about.astro`), `/poems/`
  (`poems.astro`, filtered to `form === 'poem'`), `/articles/` (`articles.astro`, all posts at current scale;
  add pagination only if the author asks, not silently).
- `/feed.xml`, `/sitemap.xml`, `/llms.txt`, `/robots.txt` keep their current paths and content contracts.
- No `src/pages/posts/index.astro` that could shadow `/posts/`; no catch-all that swallows a 404.
- `trailingSlash: 'always'` plus `build.format: 'directory'` is the single source of the trailing slash. Do not
  add redirect rules for it.

### 4.1 The blocked post's holding page

`kali-is-krishna-is-kali` has no body and cannot satisfy the collection schema. It must **not** lose its URL.
Build it as a named holding page outside the collection:

- `src/pages/posts/kali-is-krishna-is-kali.astro` renders the existing cover and the title
  “Kali is Krishna is Kali”, with an **empty article body** (no invented text, no excerpt).
- It is not a collection entry, so no `form`/`deity` is required. It is included in `/articles/` cards and in
  the feed (it is the 20th item today; keep the 20-item count and order) and in the sitemap.
- It is excluded from `/poems/` (it is not a poem), and it has no share card; `og:image` falls back to the cover.
- Its `text_sha256` must remain `e3b0c442…` (the SHA-256 of the empty string), matching the baseline.
- The page carries a comment and a test name that say it is temporary. Remove it in the same change that
  supplies the body or approves an image-only form.

This is a URL-preservation device, not a new content form. Do not generalize it into a “blank posts allowed”
rule.

**URL acceptance:** every one of the 39 URLs in `migration/url-parity.json` returns 200, and every one of the 32
post URLs serves the same `text_sha256` after the body conversion (the hash strips tags, so the new markup does
not matter). The holding page's empty hash is part of the gate, not an exclusion. A single mismatch stops
cutover.

## 5 · The verse loader/plugin

The contract's source bodies are not the final HTML. A poem is one line per line; a stotram is
`## Verse N` blocks. The renderer is the piece that turns those into the design's verse layout.

1. **Port `scripts/lib/render.mjs` to `src/lib/verse.mjs`.** Keep the two regimes: `renderPoem` / `renderStotram`
   for verse, Markdown for prose. Add a parser that returns structure, not only HTML:
   ```ts
   parseStotram(body) => {
     preambleHtml: string,
     verses: { number, iastLines, translation: string[], commentary: string[] }[],
     headings: { title, id }[],   // Introduction, Conclusion
     postambleHtml: string,
   }
   ```
   `renderStotram` becomes a thin wrapper over the parser, so the HTML and the verse strip cannot disagree.
2. **Support three gaps the current renderer has** (documented in `migration/content-audit.md` §7):
   - non-verse `##` headings (`## Introduction…`, `## Conclusion`) render as `<h2>` outside the verse block;
   - an optional `**Sanskrit:**` lead-in before the blockquote renders before it, not after;
   - a `**Commentary …**` label may carry extra words. The approved Ashtakam fix is to accept the full label
     rather than drop “and Intricacies”.
3. **Label parity.** The source needs `**Translation.**` / `**Commentary.**` for the validator, but the rendered
   text should be `Translation` / `Commentary` without the added period — the baseline text has no period there,
   and the URL-parity hash is exact. Keep the source case in the DOM (“Translation”, “Commentary”, “Sanskrit”)
   and use CSS (`text-transform`, letter-spacing) for the design's lower-case label treatment. If the DOM text
   case is changed, that is a named hash exception, not a silent edit.
4. **Poem:** `renderPoem` emits one `<p class="stanza">` per stanza with `<br />` between lines. The design's
   CSS controls line-height and measure. Do not rely on source newlines in HTML; `compressHTML: true` may
   collapse inter-element whitespace.
5. **Stotram:** each verse is a `<section id="v<n>">` with the axis, IAST blockquote, translation and
   commentary; the verse strip links to `#v1…#v9`. The parser supplies the numbers; do not hard-code nine.
6. **Prose:** use Astro's `entry.render()` / `<Content />` for short/long/update. The migration body is plain
   Markdown; no raw HTML should survive the normalizer.
7. **Tests:** the three examples in `migration/examples/` become fixtures. The after body must parse; the
   stotram fixture must yield 1 verse with the exact IAST lines; the poem fixture must yield 6 stanzas and 25
   lines; the prose fixture must render the five `**Label**\` hard breaks as five `<br>`.

## 6 · Images and share cards

### Covers

- Every migrated post gets `src/content/posts/<slug>/cover.jpg` and `image: ./cover.jpg`.
- The source image is the current `feature_image` (or the update's `feature_image`, not its card). Copy it once;
  do not re-encode by hand. The pre-build normalizes to max 1600px, JPEG q86, transparency flattened onto
  `#0B0C12` — the same rules as `scripts/lib/media.mjs`.
- `<Picture>` widths `[480, 768, 1200, 1600]`, formats `['avif', 'webp']`, `sizes` from the layout, `loading`
  eager + `fetchpriority="high"` only on the post hero; cards use lazy.
- The two posts with no feature image (`just-getting-started`, blocked `kali-is-krishna-is-kali`) keep no cover
  by default. The blocked post is not migrated until the author decides.
- The `/about/` feature image (`8e05…`, 1.93 MiB) and the index hero (`boo2.jpg`) also go through `<Image>`;
  they are not post covers but they are the heaviest non-post images.
- Delete no file in Phase 2. The 16 unused images are an author decision, recorded in
  `migration/image-inventory.md`.

### Share cards

- Keep the current 1200×630 card design: Cormorant Garamond, Schibsted Grotesk, JetBrains Mono, Tiro Devanagari,
  the trikona, the night background. It is already the house card.
- Copy `site-11ty/scripts/lib/media.mjs` to `site/scripts/lib/media.mjs` once. Do not import across the two
  trees: `site-11ty/` is the rollback and will be deleted after cutover, and a cross-tree import would make the
  new site depend on a dead path.
- Move the browser work to `scripts/cards.mjs`, run **before** `astro build`:
  `npm run cards` scans content, draws `public/images/og/<slug>.jpg` for every post whose card is missing or
  older than its cover/front matter, and exits 0. `astro build` must not launch a browser.
- The card needs the title, deity display names + Devanagari (from the vocabulary), form name, date and reading
  time. All are available from the collection; do not duplicate the strings in the script.
- `og:image` / `twitter:image` use the card; JSON-LD `image` uses the cover; both absolute URLs.
- If Playwright is unavailable, `npm run cards` must fail with the existing actionable `MediaUnavailable`
  message, not silently skip. CI installs Chromium.

## 7 · Feed, sitemap, static files

- `src/pages/feed.xml.ts`: 20 newest posts, newest first, title/link/guid/pubDate/description, absolute URLs,
  XML-escaped. The current feed is the contract; keep the item count and ordering. Description = `excerpt`.
- `src/pages/sitemap.xml.ts`: exactly the 36 current URLs (4 pages + 32 posts), `lastmod` from `date`, the same
  `changefreq`/`priority` values, absolute URLs. No trailing-slash drift, no duplicate `/posts/<slug>` and
  `/posts/<slug>/`.
- `public/llms.txt` and `public/robots.txt` are copied byte-for-byte. If `llms.txt` needs a new line for the
  design, that is an author change, not a port change.
- `public/_headers`: long cache for `/images/*`, `/css/*`, `/assets/*`; HTML `no-cache` or short cache; set
  `X-Content-Type-Options: nosniff`. Do not cache the feed for a year.
- `public/_redirects`: none required. Add one only if a URL parity failure is approved as a redirect; do not
  use redirects to paper over a changed slug.

## 8 · Cloudflare Workers static assets

`wrangler.jsonc`:

```jsonc
{
  "name": "insidethetriangles",
  "compatibility_date": "2026-11-15",
  "assets": {
    "directory": "./dist",
    "html_handling": "force-trailing-slash",
    "not_found_handling": "404-page"
  },
  "routes": [{ "pattern": "insidethetriangles.com", "custom_domain": true }]
}
```

- `npm run build` produces `dist/`; `npm run deploy` is `npm run build && wrangler deploy`.
- `npx wrangler deploy --dry-run` in CI proves the bundle without touching production.
- Preview with a Workers version/URL or a separate preview environment; keep the Cloudflare Pages project as
  the rollback until the author accepts the preview. Document the rollback command in `site/README.md`.
- Node 24 in CI (`actions/setup-node`), `npm ci`, one lockfile. `sharp` is the one native dependency Astro's
  image pipeline needs; verify it installs on the CI OS (the current workflow uses `windows-latest`; Astro is
  fine there, but test it).
- Workers static assets limits: each asset is well under 25 MiB (largest is 4.26 MiB and unused); the 20,000-file
  limit is far away. No Worker script is needed; the assets binding serves the site.

## 9 · Test plan — the files and the assertions

### `tests/url-parity.spec.ts`

- Load `migration/url-parity.json`.
- Start `scripts/serve-dist.mjs` on `dist/`; for each URL assert HTTP 200.
- For the 4 pages: assert `<title>`, canonical and `<h1>` match the snapshot.
- For the 32 posts: assert `<title>`, canonical, `<h1>` match, and `text_sha256` of the rendered
  `article` body matches. Definition is in the JSON: strip tags, collapse whitespace, preserve case.
- The blocked post `kali-is-krishna-is-kali` is **not** excluded: it is the holding page, and its
  `text_sha256` must equal the empty-string hash in the snapshot. The test names it as a holding page; if the
  author supplies a body, remove the holding page and update the baseline in the same change.
- Fail on any extra post URL not in the snapshot (a new post is fine, but it must be added to the baseline in
  the same PR).

### `tests/invalid-post.spec.ts`

- Create a temporary post in `src/content/posts/__invalid__/index.md` with `deity: "Maa Kali"`, `form: "verse"`,
  a short excerpt and raw HTML.
- Run `npm run build` as a child process; assert exit 1 and that the output names `deity`, `form`, `excerpt` and
  `body`.
- Remove the temp folder in `finally`. The test must not leave a post behind.
- A second case: a valid post with a slug that does not equal its folder name. Assert the slug-mismatch error.

### `tests/smoke.spec.ts`

- `/`, `/poems/`, `/articles/`, `/about/`, `/feed.xml`, `/sitemap.xml`, `/llms.txt`.
- One poem (`/posts/the-serpents-heart/`), one stotram (`/posts/shri-kali-tandava-stotram-translation-and-commentary/`),
  one short (`/posts/be-a-child-in-the-lap-of-ma-kali/`), one update.
- Assert the trikona SVGs are present and point down (`path` `M3 4h94L50 85z` or the approved mark), the verse
  strip has 9 links for the Tandava, and no literal `##`/`**` leaks into the page.

### `tests/a11y.spec.ts`

- `@axe-core/playwright` on the same pages; fail on `serious` or `critical`.
- Check focus visibility, one `<h1>` per page, landmark order, `lang="sa"` on Devanagari, alt text on covers
  (empty alt is acceptable only for decorative cards; the post hero is not decorative).
- The existing four suites are the baseline; port their assertions rather than deleting them.

### `tests/links.spec.ts`

- Internal links from the built HTML resolve to a file in `dist`.
- External links: allow `jaikhyapaparampara.com`, `1000namesofmakali.com`, `bhairavakalikenamosthute.com`,
  the existing fonts and the existing outbound links; fail on a new 404. The `#/portal/` Ghost link must be
  resolved or removed before this test is enabled.

## 10 · Exact acceptance criteria

Phase 2 is done only when all of these hold on Node 24:

1. `cd site && npm ci && npm run check && npm run build` exits 0.
2. All **39** URLs in `migration/url-parity.json` return **200** from the built `dist/`.
3. All **32** post `text_sha256` values match. That includes the blocked post's empty hash, served by the
   holding page. The stotram renderer strips the contract period from the rendered label and preserves the
   source case, so the two stotrams also match exactly. No word, line break, IAST character, link or image path
   changes.
4. All **32** titles, canonicals and `<h1>`s match the snapshot; the 4 page titles/canonicals/h1s match.
5. Every **collection** post (31) has a valid `form`, `deity`, `date`, `excerpt`; the holding page is the one
   named exception and carries no form/deity/excerpt. An invalid post fails the build with a field-level error
   (the test proves it).
6. `/feed.xml` has 20 items, newest first; `/sitemap.xml` has 36 `<loc>`; `/llms.txt` and `/robots.txt` are
   byte-identical to the current files.
7. Every post with a cover has `image()` width/height, AVIF/WebP derivatives at the declared widths, and no
   served derivative over 500 KiB. The post hero is eager; cards are lazy.
8. Share cards exist at 1200×630 for the 31 convertible posts. The blocked post has no card.
9. `npx wrangler deploy --dry-run` exits 0 and the preview URL serves `/`, a post, `/feed.xml`, `/sitemap.xml`.
10. Axe: 0 serious/critical on home, `/poems/`, `/articles/`, `/about/`, a poem, a stotram, a short, an update.
11. Links: internal links resolve; external allowlist passes.
12. `design-demos/` is untouched; the built home and reading page match `dir-2.html` / `dir-2-post.html` at
    1440 and 390 (spacing/typography may differ only where the real content requires it).
13. `site-11ty/` still builds and the Pages rollback is untouched. No push to `main` until the author approves
    the preview.

## 11 · Sequence and checkpoints

1. **Scaffold** `site/` with Astro 7, Node 24, one lockfile. `npm run build` with an empty home; `wrangler
   deploy --dry-run` passes.
2. **Design shell**: tokens/base/layout/components from `dir-2.css`; `Base.astro`, `SiteBar.astro`,
   `Yantra.astro`; home with the archive list. Visual checkpoint at 1440/390 against `dir-2.html`.
3. **Content config + vocabulary**: the schema above; one migrated post. Build fails on the invalid fixture.
4. **Normalizer**: apply the approved table to the 31 convertible posts; write `site/src/content/posts`; do not
   touch `site-11ty/src/posts`. Run the text-hash comparison after each batch.
5. **Verse loader**: poems and stotrams; the three examples as fixtures; the verse strip and per-verse sections.
6. **Prose + archives**: `/poems/` filters `form === 'poem'`; `/articles/` all posts; `/about/`.
7. **Images + cards**: covers, derivatives, `scripts/cards.mjs`, `og:image`.
8. **Feed/sitemap/static**: endpoints and `_headers`.
9. **Tests**: URL parity, invalid post, smoke, a11y, links.
10. **Preview**: Workers preview + Pages rollback documented; author acceptance; then cutover, DNS, and only
    then delete `site-11ty/`.

Each checkpoint should be a commit-sized change; do not run the whole migration in one edit. The URL parity test
runs after step 4 and after every later content change, not only at the end.

## 12 · Risks and how to close them

| risk | evidence | mitigation |
|---|---|---|
| Astro 7 API drift (`glob`, `z`, `entry.id`) | the brief fixes them; the local install may not exist yet | pin the exact Astro 7 version; a one-post spike before the bulk port; the `entry.id === slug` assertion is the canary |
| `compressHTML: true` collapsing poetry whitespace | the brief calls it out | start true; test the poem fixtures; if a line joins, set `compressHTML: false` and record why. Do not fix it with CSS hacks |
| Image pipeline native binary (`sharp`) on CI | the current CI is Windows; Astro needs sharp | add sharp early; run the image test in CI before the bulk migration; fall back to pre-sized covers only if the binary will not install, and record it |
| Playwright cards in CI | the current publish pipeline already depends on Chrome; CI installs Chromium | keep `scripts/cards.mjs` a pre-build, not part of `astro build`; fail closed |
| Cloudflare trailing-slash drift | 32 URLs are slash-terminated | `trailingSlash: 'always'`, `build.format: 'directory'`, `html_handling: 'force-trailing-slash'`; the parity test is the gate |
| The blocked post | no body | do not migrate it into the collection; serve the named holding page so the URL and empty hash survive. Remove the page only when the author supplies text or approves an image-only form. A deleted URL is worse than a temporary page |
| The Tandava watermark | it is the post hero, OG image and card | replace, permission, or remove before cutover; the port should not make it more prominent |
| Devanagari | 18 verses IAST-only | ship IAST-only with no empty Devanagari element; add the verse when the author supplies it; do not transliterate |
| Matangi/Skanda/Parvati/Durga taxonomy | not in the vocabulary | author confirms the `adya`/`kali` mappings or adds keys; the schema will enforce whatever is approved |

## 13 · Non-goals

- No redesign, no new colours, no new typefaces, no re-drawing of the yantra.
- No CMS, admin UI, comments, search, analytics or newsletter.
- No content edits beyond the approved table; typo fixes are a separate author pass.
- No image deletion; the 16 unused files stay until the author approves removal.
- No push to `main`, no DNS change, no Pages deletion in Phase 2.
