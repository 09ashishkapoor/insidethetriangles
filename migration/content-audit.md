# Content audit — the archive before the Astro port

**Baseline:** 2026-11-15. 32 posts, 13,328 words, 36 HTML pages, 38 files written by Eleventy. Nothing in
`src/posts/` has been changed. The proposal per post is in
[`site-11ty/content/migration-report.md`](../site-11ty/content/migration-report.md); the frozen URL contract is
[`migration/url-parity.json`](url-parity.json); the image ledger is
[`migration/image-inventory.md`](image-inventory.md).

## 1 · Numbers

| | Count | Source |
|---|---:|---|
| Posts | 32 | `src/posts/*.md` |
| Words | 13,328 | `npm run content:check` |
| HTML pages | 36 | `_site/**/*.html` |
| Files written by the build | 38 | 36 HTML + `feed.xml` + `sitemap.xml` |
| Files copied by Eleventy | 53 | 50 images + CSS + `llms.txt` + `robots.txt` |
| URLs in the sitemap | 36 | `/`, `/about/`, `/poems/`, `/articles/`, 32 posts |
| URLs in the parity snapshot | 39 | sitemap 36 + `/feed.xml`, `/sitemap.xml`, `/llms.txt` |

Build measured on Node 26.13.1 / npm 11.20.0: Eleventy reports **38 files in 0.65 s**; the whole
`npm run build` process, including `clean-output.mjs`, took **1.548 s**. All 39 snapshot URLs return **200**.

## 2 · What the audit checks report, and what this migration proposes

`npm run content:check` is the pre-migration audit. Its numbers are the baseline, not the target.

| Check | Baseline | After the proposal |
|---|---:|---:|
| No form (invisible to `/poems/`) | 9 (28%) | 0, except 1 blocked |
| No declared deity | 32 (100%) | 1 unknown (the blocked post) |
| Verse stored as HTML | 12 (38%) | 16 verse bodies to convert |
| Images over 1 MB | 14 (44%) | 14 post images flagged |
| No excerpt | 29 (91%) | 0, except 1 blocked |
| No tags | 11 posts | form supplies the tag |

The “12 verse bodies” is an undercount: `content-check` only flags posts whose form it can already derive.
Four verse posts have no form today, so they were skipped. After the proposed forms, **16** bodies need the
verse conversion: 14 poems + 2 stotrams.

`content:check` exits **0**; `content:strict` exits **1** with:
`✗ 9 posts have no form and would be invisible to the archive.` That is the correct baseline; strict mode
cannot be turned on in CI until this migration is applied.

## 3 · The nine posts with no form

These are the posts `content:check` cannot place because they have no `tags` or an unknown tag. `/articles/`
still shows all nine — it loops `collections.allPosts` — but `/poems/` omits them. The proposal gives each a form:

| post | current tag | proposed form | why |
|---|---|---|---|
| `adyas-call` | none | poem | 5 stanzas of verse, `<p>/<br>` |
| `bhairava-the-light-within` | none | poem | 3 stanzas plus invocations |
| `kali-is-krishna-is-kali` | none | **blocked** | no body; image-only |
| `mahakala-and-kalabhairava-simplified-2` | none | short | 316 words of prose |
| `navigating-spiritual-uncertainty-embracing-collapse-and-transformation` | none | short | 520 words of prose |
| `navigating-the-dance-of-material-and-spiritual-a-path-through-divine-feminine-wisdom` | none | short | 572 words of prose |
| `the-eternal-dance-of-creation-and-destruction-maa-kali-and-parashuramas-cosmic-mission` | none | short | 576 words of prose |
| `the-green-weaver-of-shadows-2` | none | poem | 18 verse lines, no `<br>` |
| `the-serpents-heart` | none | poem | 6 stanzas of verse |

The other two untagged posts are the two stotrams: `kalabhairava-ashtakam…` and `shri-kali-tandava…`. They
have a form from structure (`## Verse N`), so they are not no-form posts. Separately, three of the five
`long articles` are under 600 words and are proposed as `short` (`embracing-simplicity…` 414,
`the-alchemy-of-desire…` 484, `the-timeless-path…` 490); `the-reawakening…` (700) and
`home-your-sacred-ground` (599) stay `long`. The three untagged prose posts (`navigating-spiritual…` 520,
`navigating-the-dance…` 572, `the-eternal-dance…` 576) are also proposed `short` by the same rule.

## 4 · Posts with no confident deity

Nine posts are not `ok`. This is the list to correct first, because `deity` decides which hub a reader sees.

| post | proposed deity | confidence | why it is not certain |
|---|---|---|---|
| `just-getting-started` | — | **unknown** | no deity in the text at all. A site welcome. Do not invent one. |
| `bhairava-the-light-within` | bhairava | check | the body never names Bhairava; only the title and the closing `Jai Kalabhairava Baba` do. |
| `kali-is-krishna-is-kali` | kali | check | the title and the image text name Kali; there is no body to support more. |
| `navigating-the-dance-of-material-and-spiritual…` | kali + bhairava | check | built on Battuka Bhairava / Ma Durga and MahakalaBhairava / Mahakali. Durga is not in the vocabulary; Adya appears only in the sign-off. |
| `ode-to-adya-maa-from-a-ganda-bacha…` | kali + adya | check | the title says Adya, the text addresses Kali, and the text equates them. Two keys. |
| `skanda-the-storm` | bhairava | check | the poem is about Skanda/Karthikeya. Bhairava appears only as `Jai Canda Bhairava`. |
| `the-alchemy-of-desire…` | adya | check | about Parvati / Shakti, who is not in the vocabulary. Adya is the source mapping; it is not in the body. |
| `the-green-weaver-of-shadows-2` | adya | check | about **Matangi**, who is not in the vocabulary. Adya is the source mapping; it is not the subject. |
| `update-migration-complete-2026-03-30` | adya | check | Adya appears only in the sign-off `Jai Ma Adya — Kaliputra Ashish`. |

**Taxonomy gaps, separately.** Three subjects in the archive have no vocabulary key: **Matangi** (Green
Weaver), **Skanda/Karthikeya** (Skanda the Storm, The Timeless Path), and **Parvati/Durga** (The Alchemy of
Desire, Navigating the Dance). Mapping them to `adya` or `kali` is a judgement, not a fact. The author should
either confirm the mappings or expand `vocabulary.json`. Do not add values silently.

**Mahakala.** `home-your-sacred-ground` and `mahakala-and-kalabhairava-simplified-2` are explicitly about
Mahakala/Mahakaleshwara and keep the `mahakala` key. The approved design reads Mahakala inside Bhairava; that
is a presentation decision. It is **not** a licence to fold the key during migration. Confirm both rows.

## 5 · The Devanagari gap

This is the largest content gap the new design exposes. The design's reading page has a Devanagari title and
Devanagari verse numerals; the archive cannot fill either from its own text.

- **18 verses** across the two stotrams are **IAST only**: 9 in the Kalabhairava Ashtakam, 9 in the Shri Kali
  Tandava Stotram. **Zero** Devanagari verse lines exist.
- **60 Devanagari characters** exist in the whole archive, in 2 files:
  - Kalabhairava Ashtakam: 33 characters — `काल`, `भैरव`, and the refrain
    `काशिकापुराधिनाथकालभैरवं भजे` in prose glosses.
  - Kali Tandava: 27 characters — only the danda marks `।` and `॥` in the IAST blockquotes. No letters.
- **No post has a Devanagari title.** The only Devanagari the site can display today is the four deity names in
  `vocabulary.json` (आद्या, काली, भैरव, महाकाल) and the static text in `design-demos/`.
- The design demo's `dev-title` (`श्रीकालीताण्डवस्तोत्रं`) and its verse numerals (१–९) are placeholders. They
  are not in the content.

**Do not transliterate from memory.** The brief is explicit, and it is the right call for a sacred hymn. The
Devanagari has to come from the author, ideally as one line per IAST line so the two can be aligned. Until it
does, the Phase 2 template must render an IAST-only verse without an empty Devanagari element.

## 6 · The watermarked Tandava image

`/images/2025/11/uywjs16z45454.jpg` — 512×676, 71,231 bytes — carries a visible credit line in the bottom-left:
**“Tryst With Kaali – Praveen Radhakrishnan”**. The file itself is the watermark; there is no clean copy in the
tree.

It is not out of the hero positions. In the current build it is:

- the post's feature image (`<div class="post-feature-image">`), above the title;
- `og:image` and `twitter:image` for the post;
- the JSON-LD `BlogPosting.image`;
- the card image on `/` and `/articles/`.

The worklog's “It is out of every hero position” is wrong for the current site. Before launch it needs one of:
permission and a credit line rendered by the site; a replacement image; or removal from the post and the archive
cards. Until then it is the most visible unlicensed asset on the site.

## 7 · What cannot be converted without a decision

### 7.1 `kali-is-krishna-is-kali` — no body

Front matter plus one image. The image contains the text “KALI IS KRISHNA IS KALI”. The contract requires a
body and an excerpt; no form accepts an image-only post. **Blocked.** The author must supply a body or approve a
new image-only form. Nothing can be inferred from the image without treating the image as text, which the brief
forbids.

The URL does not have to wait for that decision. Phase 2 should serve a named holding page at the existing URL:
the cover, the title, an empty article body, no excerpt, no form/deity. It preserves the 200 response and the
empty `text_sha256`, stays in `/articles/` and the feed/sitemap, and is removed when the author supplies text or
approves an image-only form. The details are in
[`migration/next-agent-brief.md` §4.1](next-agent-brief.md).

### 7.2 `kalabhairava-ashtakam…` — two label conflicts

Every verse uses `<h3>Commentary and Intricacies:</h3>`. The validator requires the exact marker
`**Commentary.**` / `**Commentary:**`; `**Commentary and Intricacies:**` does not match. Normalizing loses the
words “and Intricacies”; keeping it fails validation. Recommendation: extend the validator/renderer to accept a
`**Commentary …**` lead-in.

The same post has `<p><strong>Sanskrit:</strong></p>` before each blockquote. The current `renderStotram`
renders non-quote lines after the quote, so the label moves. The loader needs a lead-in slot, or the author
approves dropping the word “Sanskrit:”. Recommendation: support the lead-in.

### 7.3 `shri-kali-tandava…` — non-verse headings

`## Introduction…` and `## Conclusion` are headings outside the nine verse blocks. The current `renderStotram`
only recognizes `## Verse N`; anything else becomes a literal paragraph. No text is lost, but the Phase 2 loader
must render non-verse `##` headings as headings. The example under `migration/examples/` assumes this.

### 7.4 `the-green-weaver-of-shadows-2` — split sentences

Each sentence is its own `<p>`, and two fragments are split across paragraphs (“She doesn't judge…” / “She
nutures…”). Preserving `<p>` boundaries makes them separate one-line stanzas; joining changes a line break. The
conversion preserves the split and flags it. The author should confirm the stanza shape. “nutures” is preserved.

### 7.5 The rest are safe, with the usual typography caveat

No other post loses text under the proposed rules. The archive has many Ghost-era missing spaces after
punctuation (`control,it’s`, `birth.“Just`, `optional;it’s`, `beam,a shift`). The conversion preserves them; they
are copy-edit work, not migration work. The full list of flagged candidates is in
[`migration-report.md` §6](../site-11ty/content/migration-report.md).

## 8 · Known pipeline and CI issues — recorded, not fixed

These are Phase 4 work. None was changed in Phase 0/1.

1. **Publishing is not transactional.** `scripts/publish.mjs` writes the post, image, share card and slug ledger,
   then runs the build. If the build fails, it exits 1 and tells you to delete the post — nothing is rolled
   back. A failed publish can leave a post, two images and a ledger entry behind. Fix: stage in a temporary
   directory and move into place only after the build passes, or make the build a pre-write gate.
2. **The build does not validate front matter.** `eleventy.config.js` never imports `scripts/lib/schema.mjs`.
   Only `npm run publish` and `npm run content:check` call the validator. A hand-written post with a bad
   `deity` or `form` builds successfully. Astro's content collection is the structural fix; `content:strict` in
   CI is the interim gate.
3. **CI is on Node 20.** `.github/workflows/validation.yml` uses `node-version: 20` in both jobs. The target is
   Node 24 LTS. This is a one-line change, but it belongs with the Astro/Cloudflare cutover, not Phase 1.
4. **`/articles/` is not paginated.** `src/articles.liquid` loops `collections.allPosts` and prints every card.
   The build has 32 cards. It is fine at 32 and will not be at 80. The earlier claim that untagged posts are
   “invisible to `/articles/`” is false: `/articles/` has all 32; only `/poems/` omits them.
5. **`/articles/` has no form/deity facets.** It prints one flat grid. The redesign's archive is ordered and
   filterable by deity; that is Phase 2/3 work, not a migration fix.
6. **The `Poems` tag is doing two jobs.** It is both a URL (`/poems/`) and a form. After the port, `form` and
   `deity` should drive the archive; the legacy tags can remain as compatibility metadata until the redirects
   are settled.
7. **No image derivatives.** The site serves the 50 originals as-is. The 1.93 MiB `/about/` image and the
   4.26 MiB unused file are the extremes; the post covers are 0.07–2.65 MiB. Astro's image pipeline is the fix;
   no image was moved in Phase 1.

## 9 · What was verified

- `npm run build`: exit 0, **38 files written** (36 HTML + feed + sitemap), **0.65 s** Eleventy, **1.548 s**
  wall; 91 files in `_site` including 53 copied assets. All 39 snapshot URLs return 200.
- `npm run content:check`: exit 0; 32 posts, 13,328 words, 9 no form, 32 no declared deity, 12 HTML verse,
  14 heavy images, 29 no excerpt.
- `npm run content:strict`: exit 1, the same 9 no-form posts.
- Publisher fixture `verse-ok.md --dry`: exit 0; computed slug
  `fixture-a-poem-that-should-pass`, URL `/posts/fixture-a-poem-that-should-pass/`, 43 words, 0.4 min.
- Publisher fixture `verse-broken.md --dry`: exit 1; five named errors (deity, form, date, excerpt, body) plus
  the unknown `tags` warning.
- Image inventory: **50 files, 43,981,372 bytes = 41.94 MiB**, **16 over 1 MiB**, **14 post-referenced over
  1 MiB**, **2 page-only files**, **16 unused**.
- `/articles/`: 32 cards; `/poems/`: 10 cards; 11 posts have no `tags`; the 9 no-form posts are on
  `/articles/` and absent from `/poems/`.
- The Tandava watermark is visible in the file and the image is the post hero, OG/Twitter image, JSON-LD image
  and archive-card image.

## 10 · What is blocked

- ~~**Approval of the 32-row form/deity/excerpt table**~~ — **approved 2026-11-15** as written.
- **Devanagari verse text** — 18 verses, author-only.
- **The image-only post** — author must supply a body or approve a new form.
- **The Ashtakam label decision** — schema extension vs losing “and Intricacies”.
- **The Tandava image** — permission, replacement, or removal.
- **The Matangi/Skanda/Parvati/Durga taxonomy** — confirm the adya/kali mappings or add keys.

The table is approved; Phase 2 can start. The remaining blockers above are author inputs or named Phase 2
decisions, not reasons to re-open the taxonomy.
