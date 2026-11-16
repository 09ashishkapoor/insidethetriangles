# Work log — redesign proposal and publishing pipeline

Session: 14–15 November 2026. Project: `insidethetriangles` (Eleventy 3, Cloudflare Pages).
**Nothing was committed and nothing was pushed.** Everything below is in the working tree for review.

---

## 1 · Status at a glance

| | |
|---|---|
| **Asked for** | A redesign of insidethetriangles.com, with a decision on refreshing the technology; then a way for an AI to turn supplied content into a post |
| **Delivered** | A full audit; six design candidates, three built in full; a chosen direction; a technology comparison; a working publish pipeline with validation, image intake and share cards |
| **Chosen design** | Direction 2, **The Yantra** — and the correction you gave: *the yantra has to be a triangle, nothing else* |
| **Built into the site** | The publishing pipeline only. **The redesign is not implemented** — it exists as static drafts in `design-demos/` |
| **Waiting on you** | Confirm `migration-report.md`; decide whether to start building Direction 2; supply Devanagari verse text |

---

## 2 · What was measured

Numbers from the audit, not estimates. `npm run content:check` reproduces them.

| | |
|---|---|
| Posts | **32** |
| Words | **13,328** |
| Longest pieces | Kalabhairava Ashtakam 14 min; Kali Tandava Stotram 12 min |
| Images | **49 files, 41.9 MB**, served as-is — no srcset, no AVIF/WebP |
| Largest image | `upscaled_04tv5co1.png` — 4.3 MB, displayed in a 740px column |
| Posts with **no tags** | 11 → **9 end up with no form at all**, so they are invisible to `/poems/` and `/articles/` |
| Verse stored as HTML | **12 (38%)** — `<p>` with `<br>` instead of line-based verse |
| Images over 1 MB | **14 (44%)** |
| Posts with no excerpt | **29 (91%)** |
| Deity spread (keyword-derived) | Bhairava 12 · Adya 11 · Kali 6 · Mahakala 2 |

**The diagnosis in one line:** the site is a competent generic dark blog — a 110px logo, Georgia, rounded
cards — sitting on top of 49 pieces of genuinely striking devotional art and a name that describes a place.
The trikona is used once, as decoration, and never as structure.

---

## 3 · Verified facts the design was built on

Checked against sources, recorded in [product-facts.md](product-facts.md).

- **The Kali Yantra** is a square enclosure (bhūpura) with four T-shaped gates, an eight-petalled lotus,
  concentric circles, and at the centre an inverted **śakti trikoṇa** holding a bindu.
  ([1950 Mahavidyas text, p. 24](https://sourcelibrary.org/book/dash-mahavidya-tantra-sara-yashpal/page/69d7e29de08c70307b766444))
- **A yantra is entered from outside in** — bhūpura → petals → trikoṇa → bindu (saṃhāra-krama).
- **Orientation matters.** The triangle must point down; flipping it changes the yantra
  ([Kanchi Mahaswami](https://www.kamakoti.org/kamakoti/books/ESSENCE_OF_%20LAGHU_UPANISHAD_PUSHPA_MAALA_PART_TW0.pdf)).
  Every triangle in every draft points down.
- **Kali's bīja is krīṃ / क्रीं.**
- Your existing mark (`boo2.jpg`) is already a stylised yantra: nested trikona plus bindu.

---

## 4 · The design work

Six candidates were drawn as thumbnails, three were built in full as clickable HTML with a home page and a
reading page each. All cards are in [directions.md](directions.md); the review notes are in
[polish-log.md](polish-log.md).

| | Direction | Logic | Files |
|---|---|---|---|
| 01 | **The Aperture** | Irma Boom — the book as an object; the trikona as a die-cut window | `design-demos/dir-1.html`, `dir-1-post.html` |
| 02 | **The Yantra** ✅ | Sugiura Kohei — the mandala as an information structure | `design-demos/dir-2.html`, `dir-2-post.html` |
| 03 | **The Procession** | The solar-term colour band, executed in Kalighat print grammar | `design-demos/dir-3.html`, `dir-3-post.html` |

Reserve directions, shown as thumbnails only: The Long Read, The Catalogue, The Index
(`design-demos/thumbs.html`).

### What you chose, and what changed because of it

**"direction 2. the yantra has to be a triangle nothing else."**

The draft drew a full yantra. The square, the lotus, the circles and the four gates were removed. What is
left is the mark, scaled up: **three nested triangles and a bindu**, entered from outside in.

| | |
|---|---|
| 01 आद्या — Adya Ma | the outer triangle; the source |
| 02 भैरव — Bhairava | the middle; the gate |
| 03 काली — Kali | the inner; the centre |
| — the bindu | the smallest thing on the page, holding the newest piece |

Consequence to confirm: a triangle has three points, so **Mahakala no longer has a ring of its own** and
reads within Bhairava — which is how your own commentary already treats it.

The reading page carries the same idea sideways: a gold axis with the verse numbers hanging off it, IAST
verse, translation, commentary — the structure your stotram commentaries already have, typeset.

**Not done:** the redesign has not been built into the site. `dir-2.html` is a static draft.

---

## 5 · The technology decision

[tech-refresh.md](tech-refresh.md) compares four options. The short version:

- The framework is **fourth** on the list of problems, behind image weight, unvalidated front matter, and
  Ghost HTML in the post bodies.
- **Eleventy + `@11ty/eleventy-img`** gets ~90% of the visible benefit for a fraction of the work.
- **Astro 5** is the right destination *if* AI-assisted publishing becomes permanent, because the content
  schema becomes the thing the build cannot ignore.
- Recommended sequence: **contract → design → Astro → automated cards**. The contract came first because it
  fixes a live problem and is portable between frameworks.

**Still undecided:** whether to move to Astro at all.

---

## 6 · The publishing pipeline (built and working)

The requirement: *"I will provide the content and tell AI: hey publish this content."*

An LLM asked to publish will optimise for the file existing, not for the site being right. The only fix is
to make the correct thing the only thing that passes. Design write-up in
[publishing-pipeline.md](publishing-pipeline.md); the agent-facing contract is
[site-11ty/content/PUBLISHING.md](site-11ty/content/PUBLISHING.md).

### How it works

1. A draft carries **six fields**, four of them required: `title`, `deity`, `form`, `date`, `excerpt`,
   optional `image`. Everything else — slug, layout, reading time, image path, share card — is computed.
2. `deity` and `form` come from a **closed vocabulary** (`site-11ty/content/vocabulary.json`): four deities,
   five forms. Two deities are allowed: `deity: [kali, bhairava]`.
3. The body follows **one convention per form**. A poem is one line per line, blank line between stanzas,
   no HTML. A stotram is `## Verse N` with a blockquote, `**Translation.**` and `**Commentary.**`, numbered
   without gaps. Prose is ordinary Markdown, HTML rejected.
4. One command: `npm run publish -- content/inbox/x.md`. It validates, resizes the image to 1600px, draws a
   1200×630 share card, writes the post, moves the draft aside, records the slug in a ledger, and builds.
5. On failure it exits 1 with the field, the allowed values and the fix — the thing an agent can act on
   without asking you.

### Files

| file | what it is |
|---|---|
| `site-11ty/content/vocabulary.json` | The closed vocabulary and the limits |
| `site-11ty/content/PUBLISHING.md` | The contract, written for an agent |
| `site-11ty/scripts/publish.mjs` | The command |
| `site-11ty/scripts/content-check.mjs` | The archive audit and migration report |
| `site-11ty/scripts/lib/schema.mjs` | The validator — one file used by both |
| `site-11ty/scripts/lib/frontmatter.mjs` | A small YAML reader/writer, no dependencies |
| `site-11ty/scripts/lib/render.mjs` | Poem and stotram rendering |
| `site-11ty/scripts/lib/media.mjs` | Image resizing and share cards, drawn by the Chrome already installed |
| `site-11ty/content/fixtures/` | One draft that passes, one wrong on purpose, one with an image, and `example-share-card.jpg` |
| `site-11ty/src/posts/.published-slugs.txt` | Slug ledger, seeded with the 32 posts — makes a duplicate publish fail |

### Small changes to existing files

- `package.json` — adds `publish`, `content:check`, `content:report`, `content:strict`, and syntax-checks the new scripts.
- `src/_includes/base.liquid` — `og:image` and `twitter:image` now prefer `og_image` (the share card); structured data still points at the content image.
- `README.md` — the "Writing a Post" section now documents the publish flow.
- `.gitignore` — adds `content/published/` and `.huashu-design/`.

---

## 7 · What was verified

- The valid fixture passes and prints the computed slug, URL, tag mapping and reading time.
- The broken fixture fails with five named errors and exit code 1.
- A fixture with a **2.7 MB PNG** published end to end: resized to 912×1600 / 201 KB, share card drawn,
  front matter written, draft moved out of the inbox, slug added to the ledger.
- `npm run build` succeeds; the generated page carries `og:image` pointing at the card.
- The fixture post and its generated image were then deleted — the site is back to 38 pages.
- Both preview servers were stopped on request; ports 8080 and 8081 are closed.

**Not verified, and why:** `polish.py` and `design_lint.py` need Python Playwright, which is not installed,
so every design screen was reviewed by hand at 1440 and 390 with a custom audit for overflow, font-size and
tap targets. No Lighthouse or Core Web Vitals run was done — the image-weight finding is measured in bytes.

---

## 8 · Open items

1. **Confirm the migration report** — `site-11ty/content/migration-report.md` proposes a form and a deity for
   all 32 posts and flags its confidence. Correct it, and the archive can be rewritten into the contract.
2. **Decide on Direction 2** — implement it into the Eleventy templates, or move to Astro first.
3. **Mahakala** — folded into Bhairava by the triangle. Say if that is wrong.
4. **Devanagari verse** — the archive has IAST only. I will not transliterate a sacred hymn from memory;
   the text has to come from you.
5. **The watermarked image** — the Tandava cover is a photograph marked *"Trust With Kaali – Praveen
   Radhakrishnan"*. It is out of every hero position, but should not stay as a post cover without permission.
6. **Turn on `content:strict` in CI** — only after the migration, or it fails on day one.

---

## 9 · How to run things

```bash
cd site-11ty
npm install                                  # first time only
npm run dev                                  # http://localhost:8080
node scripts/publish.mjs content/fixtures/verse-ok.md --dry
node scripts/publish.mjs content/fixtures/verse-broken.md --dry
npm run content:check -- --report
npm run build
```

The design drafts are static files; open `design-demos/dir-2.html` in a browser, or serve the folder if you
want the relative assets to behave exactly as they will in production.

---

## 10 · Repository state

Uncommitted, by design — you asked to review before anything leaves the machine.

**Modified:** `.gitignore`, `README.md`, `site-11ty/package.json`, `site-11ty/src/_includes/base.liquid`

**New:** `site-11ty/content/` (vocabulary, contract, fixtures, migration report), `site-11ty/scripts/publish.mjs`,
`site-11ty/scripts/content-check.mjs`, `site-11ty/scripts/lib/`, `site-11ty/src/posts/.published-slugs.txt`,
`design-demos/`, `product-facts.md`, `directions.md`, `direction-approved.md`, `polish-log.md`,
`tech-refresh.md`, `publishing-pipeline.md`, this file.

**Environment note:** `site-11ty/node_modules` was installed with pnpm so the build could be verified. It is
gitignored and `package-lock.json` was not touched.
