# Publishing a post

This file is written for the agent, not the reader. It is the write-side twin of `public/llms.txt`.
Follow it exactly; the publisher enforces it.

## One command

```bash
cd site-11ty
npm run publish -- content/inbox/my-piece.md
```

The draft is validated, the image is resized, a share card is drawn, the file is written to
`src/posts/`, and the site is built. On success it prints the URL. On failure it prints the field, the
allowed values and the fix, and writes nothing. **Nothing is pushed to a remote.**

Add `--dry` to validate and preview without writing anything. Do that first, every time.

## The draft

```yaml
---
title: "Be a Child in the lap of Ma Kali"
deity: kali
form: short
date: 2025-06-10
excerpt: "Devotion as the innocence of a child, and what surrender erases."
image: content/inbox/images/kali-child.jpg
---

Body goes here.
```

| field | required | rule |
|---|---|---|
| `title` | yes | 4–90 characters. Used as the page title and the share card headline. |
| `deity` | yes | One of `adya`, `kali`, `bhairava`, `mahakala`. Two allowed: `deity: [kali, bhairava]` — the first is primary. |
| `form` | yes | One of `poem`, `short`, `long`, `stotram`, `update`. |
| `date` | yes | `YYYY-MM-DD`. Not in the future. |
| `excerpt` | yes | 40–200 characters. Used on cards, in search results and in the meta description. |
| `image` | no | Path to a jpg/png/webp, **relative to the draft file**. Resized to 1600px automatically. |

Nothing else. `slug`, `layout`, `reading time`, `tags` and the final image path are computed — writing
them in a draft is pointless and is reported as a warning.

## The body, by form

**`poem`** — one line per line. A blank line ends a stanza. No HTML, ever.

```
Beyond the forms you seek, I stand
Adya, the first, the flame unplanned.
No shrine yet holds My true face,
No chant confines My boundless grace.

The lake where Kanda's fire was spun,
The wounds of bloodlines left undone
```

**`stotram`** — a repeating block. Every verse needs the heading, a `>` blockquote holding the
transliteration, a `**Translation.**` paragraph and a `**Commentary.**` paragraph. Numbered 1..n with
no gaps.

```markdown
## Verse 1

> huṃhuṃkāre śavārūḍhe nīlanīrajalocane ।
> trailokyaikamukhe divye kālikāyai namo'stute ॥1॥

**Translation.** To Her who resounds with the primordial sound "Huṃ,"…

**Commentary.** **huṃṃkāre:** "Huṃ" is a powerful bīja (seed) mantra…
```

**`short` / `long` / `update`** — ordinary Markdown. `##` headings are fine. Raw HTML is rejected: no
`<p>`, `<br>`, `<div>`, no `class=` attributes. Markdown covers everything you need.
A `short` or `long` needs at least 40 words; an `update` may be shorter.

## Images

Drop the file somewhere under `content/inbox/`, reference it relative to the draft, and the publisher
resizes it to 1600px, flattens transparency onto the site's night colour, writes it to
`public/images/YYYY/MM/<slug>.jpg` and draws a 1200×630 share card at `public/images/og/<slug>.jpg`.
Do not hand-place files in `public/`.

## Choosing the values

- **Deity.** Pick the one the piece is *about*, not the one it mentions most. If a piece is about Kali
  but addresses Bhairava as the gate, that is `[kali, bhairava]`. If you cannot tell, **ask the author**
  — do not guess. This field decides which hub the piece appears under, and it is the one field a
  reader will notice being wrong.
- **Form.** Verse → `poem`. A hymn with verse/translation/commentary → `stotram`. Prose under ~600
  words → `short`. Prose over ~600 words → `long`. Site news → `update`.
- **Excerpt.** One sentence in the author's register. Not a summary of the article; a line that makes
  someone want to read it.

## When it fails

The error names the field and the fix. Read it and correct the draft — do not work around it.

```
✗ content/inbox/piece.md — 2 problems
  deity: "Maa Kali" is not in the vocabulary.
         Use one of: adya, kali, bhairava, mahakala
  body: raw HTML found (<br>). Bodies are Markdown only …
```

## Test it before you trust it

`content/fixtures/` holds two drafts: one that passes all the way through and one that is wrong on
purpose. Run both with `--dry` to see the difference:

```bash
npm run publish -- content/fixtures/verse-ok.md --dry
npm run publish -- content/fixtures/verse-broken.md --dry
```

## Auditing what is already there

```bash
npm run content:check              # every post against the same rules, report only
npm run content:report             # …and write content/migration-report.md
npm run content:strict             # exit 1 if anything would be invisible to the archive
```
