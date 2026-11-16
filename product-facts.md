# product-facts.md — verified before design

Everything below was checked in this session (2026-11-14). No claim here is from memory.

## 1. The Kali Yantra — what the triangles actually are

The user's brief: *"keep it Kali MA focused. The triangles are her yantra."* That is factually right, and it
constrains the geometry. Verified structure of a Kali Yantra:

| Layer | Sanskrit | What it is |
|---|---|---|
| Outer | bhūpura | Square enclosure with four T-shaped gates, one on each cardinal side |
| Next | aṣṭadala padma | Stylised eight-petalled lotus |
| Next | — | Concentric circles |
| Centre | śakti trikoṇa + bindu | A single **downward-pointing (inverted) triangle** framing a central point |

Source: [The Essence of the Tantra of the Ten Mahavidyas (1950), p. 24 — description of a Kali Yantra diagram](https://sourcelibrary.org/book/dash-mahavidya-tantra-sara-yashpal/page/69d7e29de08c70307b766444)

**The mark in `public/images/2025/06/boo2.jpg` is a stylised Kali Yantra:** four concentric downward
triangles with a bindu at the centre. It reads as the yantra's layers compressed to the śakti trikoṇa, and it
is a good mark — it is simply not used for anything.

## 2. Two hard constraints that come out of the sources

1. **The triangle must point down.** The śakti trikoṇa is inverted; orientation is not decorative. The
   Kanchi Mahaswami's caution is explicit: *"Even if the design is right, if the Shri Yantra's central
   triangle points upwards instead of downwards, the result would be different"*
   ([Essence of Laghu Upanishad Pushpa Mala](https://www.kamakoti.org/kamakoti/books/ESSENCE_OF_%20LAGHU_UPANISHAD_PUSHPA_MAALA_PART_TW0.pdf)).
   → **Design rule for all three directions: no upward triangle, anywhere, ever — not in a rotated logo, not
   in a bullet, not in an arrow glyph that reads as a trikona.**
2. **A yantra is entered from outside in.** Worship proceeds bhūpura → petals → trikoṇa → bindu
   (saṃhāra-krama / laya-krama), outermost enclosure first, bindu last
   ([shodhganga, ch. 3](https://shodhganga.inflibnet.ac.in/bitstream/10603/259211/6/06_chapter%203.pdf)).
   → **Design rule: the site's name is a spatial promise.** "Inside The Triangles" describes the reader's
   path — from the outer frame inward to the bindu. The bindu is the smallest element and the most
   important. That is a structure, not a metaphor to decorate with.

## 3. Kali's bija

**krīṃ / क्रीं** is Kali's seed syllable; the common mantra is *Om Kreem Kalikaye Namah*.
([Kreem beej mantra](https://projectbhakti.com/mantras-practices/kreem-beej-mantra/), [Om Kreem Kalikaye Namah](https://projectbhakti.com/mantras-practices/how-to-chant-om-kreem-kalikaye-namah/))
The site already knows this — the Tandava commentary uses "Huṃ" as the bīja of the stotram's first verse.
Devanagari used in the drafts: काली (Kālī), आद्या (Adyā), भैरव (Bhairava), क्रीं (krīṃ).

## 4. What is actually in the site today

Measured, not estimated:

| Fact | Value |
|---|---|
| Posts | **32** (`.md` in `site-11ty/src/posts/`) |
| Total words | **13,328** (the publishing tool's count; a wider tokenizer that splits hyphenated words gives 13,559) |
| Longest pieces | Kalabhairava Ashtakam commentary **3,266 w / 14.5 min**; Shri Kali Tandava Stotram **2,770 w / 12.3 min** |
| Most posts | short — 18 of 32 are under 1 minute of reading |
| Images | 49 files, **41.9 MB** total, served as-is (passthrough copy, no srcset/AVIF/WebP) |
| Largest | `upscaled_04tv5co1.png` **4.3 MB**; `zxc.png` 2.7 MB; `kalabhairava.png` 2.1 MB |
| Generator | Eleventy 3.1.5, Liquid, no client JS |
| Host | Cloudflare Pages (root `site-11ty`, build `npm run build`, output `_site`) |
| Tests | Playwright smoke / a11y / visual / performance + lychee link check, CI on `windows-latest` |
| Tags | Inconsistent: `["Poems"]`, `["long articles"]`, `["short articles"]`, `["updates"]`, or **no tags at all** (11 posts) |

**Deity spread** (keyword count across title + body, dominant wins): **Bhairava 12 · Adya 11 · Kali 6 ·
Mahakala 2** (plus 1 unclassifiable). This matters: the user wants the site *framed* around Kali, but the
corpus is Bhairava-heaviest. The theology in the author's own Tandava commentary resolves it:

> *"Bhairava is the ultimate Guru and kshetrapala (firewall) for shakti vidya."* — [live page](https://insidethetriangles.com/posts/shri-kali-tandava-stotram-translation-and-commentary/)

→ **IA proposal: Bhairava is the gate, Kali is the centre.** Not four equal hubs. A gate you pass through,
then her.

## 5. The structure that is already in the content and not designed for

Every verse of both stotram commentaries follows the same block, verified on the live site:

```
## Verse N
> IAST transliteration, two lines, with । and ॥N॥
### Translation
one paragraph
### Commentary
bolded Sanskrit term: explanation …
```

That repeating block is the single most valuable structural asset on the site. It currently renders as plain
h2 / blockquote / h3. It should be a designed object — verse number, Devanagari, IAST, translation,
commentary, in a fixed hierarchy — because it is what a reader comes back for.

Poems are the opposite problem: the body is `<p>` runs with `<br>` line breaks inside paragraphs, rendered at
the essay measure. Verse needs its own measure, its own leading, and its stanza structure honoured.

## 6. Register of the writing (so the design does not get it wrong)

Sincere and erudite, but loose and funny: *"ganda bacha (wayward child)"*, *"dropping the JDAM (phat) of
jnana"*, *"see the code of the matrix like NEO"*, *"chilling with Bhairava"*. This is **not** an ashram
brochure. A design that is only solemn will misrepresent the author; a design that is only playful will
misrepresent the goddess. The register is: **sacred frame, human voice inside.**

## 7. Screened out (checked, not usable)

- `moma.org/collection` and `poetryfoundation.org` — both returned a Cloudflare bot wall to the headless
  browser. They were **not** used as references; no claim is made about how they look.
- Live references that were actually captured and dissected: `emergencemagazine.org`,
  `publicdomainreview.org` (screenshots in `.huashu-design/refs/`).
