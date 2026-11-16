# Conversion examples

Three before/after pairs, using the rules proposed in
[`site-11ty/content/migration-report.md`](../../site-11ty/content/migration-report.md). They exist to make the
body conversion reviewable before any of `src/posts/` is touched. Nothing here is published or imported by the
site.

| example | form | before | after | what it proves |
|---|---|---|---|---|
| The Serpent’s Heart | poem | [`poem-serpents-heart.before.md`](poem-serpents-heart.before.md) | [`poem-serpents-heart.after.md`](poem-serpents-heart.after.md) | `<p>` → stanza, `<br>` → line; empty `<p>` dropped; bold invocation kept |
| Shri Kali Tandava Stotram | stotram | [`stotram-tandava.before.md`](stotram-tandava.before.md) | [`stotram-tandava.after.md`](stotram-tandava.after.md) | `## Verse N`; IAST blockquote; `**Translation.**` / `**Commentary.**`; section headings; `<hr>` dropped |
| The Alchemy of Desire | prose (`short`) | [`prose-alchemy-of-desire.before.md`](prose-alchemy-of-desire.before.md) | [`prose-alchemy-of-desire.after.md`](prose-alchemy-of-desire.after.md) | Ghost `<p>` / `<strong>` / `<em>` → Markdown; `<br>` → visible hard break |

The Tandava pair is a **representative section** — the preamble, Introduction and Verse 1 of 9, clearly marked
in both files. The other two are the full post bodies. Front matter is omitted from every pair: the slug is
frozen in the report and will be carried by the content entry, and the examples are about the body only.

## The rules applied

1. **Block structure is preserved.** A `<p>` is one block. In a poem, a `<p>` is a stanza and a `<br>` is a line
   break. In prose, a `<p>` is a paragraph and a `<br>` is a hard line break. A blank line separates blocks.
2. **Inline semantics are preserved.** `<strong>` → `**`, `<em>` → `*`, `<a href>` → `[text](href)`. Nested
   `<strong><em>` becomes `***…***`; a leading space inside the emphasis is moved outside the markers so the
   Markdown is valid, not deleted.
3. **Entities are decoded once.** `&nbsp;`, `&amp;`, `&quot;`, `&#39;`, `&lt;`, `&gt;` become their characters.
   Nothing is re-encoded.
4. **Typography is not rewritten.** The source already contains curly quotes and curly apostrophes; they stay.
   Straight quotes are not converted to smart quotes, and smart quotes are not converted to straight. No
   transliteration and no Devanagari is invented.
5. **Line breaks stay line breaks.** In prose, a `<br>` becomes a CommonMark backslash hard break (`\` at the
   end of the line), which renders as `<br>` and leaves the next word on the next line. In a poem, it becomes a
   newline. Paragraph boundaries are never joined.
6. **A stotram is split on its headings.** `## Verse N` is the contract marker. The blockquote holds the IAST
   lines. The existing `Translation` and `Commentary` headings become the required `**Translation.**` and
   `**Commentary.**` lead-ins. Additional commentary paragraphs stay paragraphs.
7. **`<hr>` is structural, not text.** It is dropped when it merely separates two headings (`## Verse N` already
   delimits), and would be kept as `---` only between two prose blocks. In the Tandava example all section
   dividers are dropped; no words are lost.
8. **No HTML survives.** The after bodies contain no `<p>`, `<br>`, `<div>` or `class=`. The only angle brackets
   are in URLs or text, and there are none in these three sections.

## Verification

Each after body was compared character-for-character against the before body after stripping HTML/Markdown
markers, collapsing whitespace and preserving case. That proves no word, diacritic, line of verse or punctuation
was dropped except where noted:

| example | before text chars | after text chars | result |
|---|---:|---:|---|
| The Serpent’s Heart | 947 | 947 | identical; 6 four-line stanzas + closing line = 25 lines, 7 blocks |
| The Alchemy of Desire | 3,075 | 3,075 | identical; 5 labelled paragraphs + 2 credit lines |
| Tandava, preamble + Verse 1 | 2,852 | 2,854 | identical except two periods added by the required `**Translation.**` / `**Commentary.**` markers |

The Tandava is +2 characters because the source headings are `Translation` and `Commentary` with no punctuation;
the contract requires the period. The words are unchanged. This is the only text difference in the three
examples.

The comparison script is the one used to generate these files:

```bash
node migration/tools/convert-example.mjs --post=the-serpents-heart --form=poem
node migration/tools/convert-example.mjs --post=the-alchemy-of-desire-transforming-physicality-into-spiritual-mastery --form=prose
node migration/tools/convert-example.mjs --post=shri-kali-tandava-stotram-translation-and-commentary --form=stotram --stop-after-verse=1
```

It is a prototype of the Phase 2 normalizer, not a production tool: it does not write `src/posts/`, does not
validate front matter, and does not touch images.

## What the examples expose

- **The Tandava's `## Introduction` / `## Conclusion` headings are not verse blocks.** The current
  `scripts/lib/render.mjs` only recognises `## Verse N`; any other `##` becomes a literal paragraph. The Phase 2
  loader must render non-verse `##` headings as headings. This is a loader gap, not a text change.
- **The Ashtakam is not used as the stotram example.** Its labels are `Commentary and Intricacies:` and
  `Sanskrit:`, which conflict with the exact contract marker and the current quote ordering. That decision is
  recorded in [`migration-report.md` §5.2](../../site-11ty/content/migration-report.md), not hidden in an
  example.
- **No Devanagari is present.** The Tandava is IAST-only; the example preserves every IAST character. The
  Devanagari verse has to come from the author, as the audit says.
- **Front matter is deliberately absent.** The existing `slug` is the URL contract. It is listed per post in the
  report and will become the Astro entry ID; it is not something the body conversion should recompute.
