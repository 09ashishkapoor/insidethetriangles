# Publishing pipeline — "here is content, publish it"

> **Status: implemented 2026-11-14.** Built and verified on the current Eleventy site; nothing was
> committed or pushed. See [What exists now](#what-exists-now) at the end for the file list, the
> review commands, and the two things I could not verify without you.

Requirement (your words): *"i will provide the content and tell AI: hey publish this content."*

That is a specific engineering requirement, not a content-strategy one. It means the repository has to accept a draft
from a machine and either **turn it into a correct post** or **refuse with an error the machine can act on**. Right now it
does neither: it accepts anything and fails silently.

## Why it cannot work today

Three failures already in the repo, all of the same shape — the build succeeds, the site is wrong:

| Symptom in the repo today | What an LLM would have produced | Why nothing caught it |
|---|---|---|
| 11 of 32 posts have no `tags` at all | `tags:` omitted, or invented (`Kali Maa`, `Mother`) | Tags are free strings; nothing validates them |
| Poems stored as `<p>…<br>…</p>` because they came from Ghost | `<br>` in one file, plain newlines in another, `<br />` in a third | No canonical verse format |
| `upscaled_04tv5co1.png`, 4.3 MB, in a 740px column | references a 6 MB raw export by its original filename | Nothing checks image weight or existence |

An LLM asked to "publish this" will optimise for *the file existing*, not for *the site being right*. The only way to make
it reliable is to make the correct thing the only thing that passes.

## The contract

Three pieces: a closed vocabulary, a draft format with no ambiguity, and one command that fails loudly.

### 1 · Closed vocabulary

`content/vocabulary.json` — the only values the agent may use. Everything else is rejected.

```json
{
  "deities": ["adya", "kali", "bhairava", "mahakala"],
  "forms":   ["poem", "short", "long", "stotram", "update"]
}
```

Display names and Devanagari live in the renderer, not in the content. The agent picks from four words,
not from its impression of Hindu deity naming.

### 2 · Draft format

The agent writes one file. Front matter is deliberately small — **six fields, four of them required** — because every
field the agent doesn't write is a field it can't get wrong.

```yaml
---
title: "Be a Child in the lap of Ma Kali"      # 4–90 chars
deity: kali                                     # required, from vocabulary
form: short                                     # required, from vocabulary
date: 2025-06-10                                # required, YYYY-MM-DD
excerpt: "Devotion as the innocence of a child, and what surrender erases."
image: content/inbox/images/child-kali.jpg      # optional, path relative to the draft
---
```

Everything else is **computed by the publisher and never authored**: `slug`, `layout`, the final `image` path and its
dimensions, `readtime`, `og_image`, and the ISO timestamp. If a draft contains any of those, it is ignored with a warning.

A piece may belong to more than one deity — `deity` also accepts a list, first one primary:

```yaml
deity: [kali, bhairava]
```

### 3 · Body conventions — one per form

**`form: poem`** — the whole body is verse. One line is one line. A blank line ends a stanza. No HTML, no `<br>`,
no leading spaces. The publisher converts stanza structure itself, so no two poems can be laid out differently.

```
Beyond the forms you seek, I stand
Adya, the first, the flame unplanned.
No shrine yet holds My true face,
No chant confines My boundless grace.

The lake where Kanda's fire was spun,
The wounds of bloodlines left undone
```

**`form: stotram`** — the repeating block your two commentaries already use, made mandatory. Every `## Verse N` must
carry a blockquote, a `**Translation.**` paragraph and a `**Commentary.**` paragraph, numbered from 1 without gaps.

```markdown
## Verse 1

> huṃhuṃkāre śavārūḍhe nīlanīrajalocane ।
> trailokyaikamukhe divye kālikāyai namo'stute ॥1॥

**Translation.** To Her who resounds with the primordial sound "Huṃ," who is mounted upon a lifeless form…

**Commentary.** **huṃhuṃkāre:** "Huṃ" is a powerful bīja (seed) mantra…
```

**`form: short` / `long` / `update`** — plain Markdown. `##` headings allowed. Raw HTML is rejected (that is what
produced the `kg-*` classes and the `<br>` verse in the first place).

## The command

```bash
npm run publish -- content/inbox/2026-11-14-child-kali.md
```

In order: parse → validate against the schema → check slug and route collisions → resolve and normalise the image
(1600px, JPEG q86, written to `public/images/YYYY/MM/`) → generate the share card → rewrite the front matter with the
computed fields → move the file into `src/posts/` → build → re-check. It prints the final URL, the image path, the
computed reading time, and the rendered excerpt.

Useful flags: `--dry` (validate only, write nothing), `--slug=…` (override the derived slug), `--push` (commit and push,
only if you decide the agent may).

### The error contract — this is the part that makes it work with an LLM

Every failure names the file, the field, the allowed values, and the fix. The agent reads the error and corrects itself
without asking you:

```
✗ content/inbox/child-kali.md
  deity: "Maa Kali" is not in the vocabulary.
         Use one of: adya, kali, bhairava, mahakala.
         (If the piece is about more than one, use a list: deity: [kali, bhairava])

✗ content/inbox/ode.md
  body: 14 raw HTML tags found (<br>, <p>). form: poem does not take HTML.
        Delete them and keep one line per line; a blank line ends a stanza.
```

Exit code 1 on any failure, so a script — or an agent — stops rather than publishing something broken.

## What the interaction looks like

1. You paste the content and say *"publish this."*
2. The agent writes `content/inbox/<slug>.md` following `content/PUBLISHING.md`.
3. It runs `npm run publish -- …`.
4. If it fails, the error names the field and the allowed values; the agent fixes and re-runs.
5. On success it gives you the URL, the share card, and the first paragraph as it will render.
6. It commits **only if** you've allowed that (see below).

`content/PUBLISHING.md` is the agent-facing document — the write-side twin of the `llms.txt` the site already
publishes for machine *readers*. Both are written for a machine, neither is for show.

## What it changes in the technology call

This is the one requirement that genuinely favours Astro, and for a precise reason:

| | Eleventy (today) | Astro 5 |
|---|---|---|
| Where the rules live | a schema file + a validator I write | `content.config.ts` — Zod, and the build reads it |
| If a draft is wrong | my validator has to be called correctly | the build cannot succeed |
| One source of truth | schema file, imported by the publisher and the build | the same file, and the agent can read it as documentation |
| Verse rendering | Liquid filter | a `<Verse>` component reading the collection |

**Updated recommendation:** the contract above is framework-independent — build it now on the current Eleventy site, where
it will do the most immediate good, and it transfers to Astro unchanged because the schema file is portable. But if
AI-assisted publishing is the long-term workflow, Astro is the right destination: there, the schema *is* the door, and no
one — human or model — can walk past it. See the sequence in [tech-refresh.md](tech-refresh.md).

---

# What exists now

All three decisions are in: **no push anywhere**, **two deities allowed**, **share cards on by default**.

## The files

| file | what it is |
|---|---|
| `site-11ty/content/vocabulary.json` | The closed vocabulary. Deities, forms, limits. Add a value here and it becomes legal everywhere, including the error messages. |
| `site-11ty/content/PUBLISHING.md` | The contract, written for an agent. Front matter, the two body conventions, images, what every error means. |
| `site-11ty/scripts/lib/schema.mjs` | The validator. One file used by the publisher *and* the archive audit. |
| `site-11ty/scripts/lib/frontmatter.mjs` | A deliberately small YAML reader/writer — supports exactly the contract's shape and rejects the rest with a readable message. No dependencies. |
| `site-11ty/scripts/lib/render.mjs` | Poem and stotram rendering. Prose passes through to Eleventy's Markdown. |
| `site-11ty/scripts/lib/media.mjs` | Image normalisation and share cards, drawn by the Chrome already installed — no sharp, no ImageMagick. |
| `site-11ty/scripts/publish.mjs` | The command. |
| `site-11ty/scripts/content-check.mjs` | The audit and the migration report. |
| `site-11ty/content/fixtures/` | One draft that passes, one that is wrong on purpose, and `example-share-card.jpg` so you can see a card without running anything. |
| `site-11ty/src/posts/.published-slugs.txt` | Slug ledger, seeded with the 32 existing posts. This is what makes a re-published draft fail instead of duplicating. |

Two small changes to existing files: `package.json` gains `publish`, `content:check`, `content:report`,
`content:strict` and syntax-checks the new scripts; `base.liquid` now prefers `og_image` for
`og:image`/`twitter:image` only — structured data still points at the content image.

## How to review it

```bash
cd site-11ty
npm install                                  # if node_modules is not there
node scripts/publish.mjs content/fixtures/verse-ok.md --dry       # passes, prints the post it would write
node scripts/publish.mjs content/fixtures/verse-broken.md --dry   # fails with five named problems
node scripts/content-check.mjs                                    # the 32, audited
node scripts/content-check.mjs --report                           # …and writes content/migration-report.md
npm run build                                                     # the site still builds
```

## What I verified

- The valid fixture passes validation and prints the computed slug, URL, tag mapping, reading time.
- The broken fixture fails with five errors, each naming the field and the allowed values, exit code 1.
- A fixture with a 2.7 MB PNG was published end to end: resized to 912×1600 / 201 KB, share card drawn,
  front matter written, moved out of the inbox, slug added to the ledger.
- `npm run build` succeeds and the generated page carries `og:image` pointing at the card.
- `content:check` runs over all 32 posts: **9 have no form** (28%), **12 store verse as HTML** (38%),
  **14 carry an image over 1 MB** (44%), **29 have no excerpt** (91%).
- The fixture post and its generated image were then deleted; the card is kept as
  `content/fixtures/example-share-card.jpg`. The site is back to 38 pages.

## What I could not verify, and what needs you

- **The migration itself.** `content:check` proposes a form and a deity for every post and flags its
  confidence, but nothing has been rewritten. That is the next piece of work, and it should be your
  report to correct before any file changes.
- **Whether `Poems` should stay the tag.** The publisher maps each form onto the existing tag vocabulary
  (`poem → Poems`, `stotram → long articles`) so the current site keeps working. When the redesign lands,
  the tag becomes redundant and `form`/`deity` take over — worth deciding then, not now.

## The 32 that already exist

The publisher only governs new content. The back catalogue has to be brought into the same shape once, by a normaliser
that reports rather than guesses:

- old tags → `form` (`Poems` → poem, `long articles` → long, `short articles` → short, `updates` → update;
  the two stotram commentaries by structure)
- keyword-derived `deity` for every post, with a **confidence flag**
- `<p>`/`<br>` poems → line-based verse
- writes `content/migration-report.md` listing every guess, worst first

You approve or correct that report once, and from then on the schema is the only thing standing between a draft and the
site.

## Next

The three open decisions are settled — nothing pushes, two deities are allowed, cards are on. What is
left is the migration: correct `content/migration-report.md`, then rewrite the 32 posts into the
contract. After that, `content:strict` goes into CI and the door is closed behind the archive.
