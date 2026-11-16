# Six direction candidates → three to build

Brief as understood (from your answers, 2026-11-14):

> **Kali Ma is the protagonist. The triangles are her yantra and must be on the site. Surprise me. The site
> must be discoverable and shareable. Whole site plus new IA. Mobile-first. Nothing is sacred — the mark,
> the red, dark mode and zero-JS are all negotiable. New capabilities: browse by deity, search, reading time,
> archive by year. Technology refresh: advise me.**

Design spec shared by all six (so the comparison is fair):

- **Viewports:** desktop 1440 and mobile 390, mobile designed first.
- **Content:** real posts, real titles, real dates, real reading times (computed from word counts at 225 wpm),
  real images from `public/images/`. No Lorem, no invented statistics.
- **IA:** Home · Kali · Adya Ma · Bhairava · Mahakala (the gate) · Poems · Articles · Archive by year · Search · About.
- **The invented-IA caveat:** the deity grouping is derived by keyword frequency, not by the author. Bhairava 12,
  Adya 11, Kali 6, Mahakala 2. The author must confirm the real mapping; the counts shown are those derived.
- **Every direction must answer the same three tests:** can you find a poem in two taps, can you get from a
  stotram verse to its translation without losing your place, does a shared link look worth opening.

---

## 1 · Best designer — Irma Boom · **"The Aperture"**

| | |
|---|---|
| **Logic & source** | Irma Boom (Dutch book designer, b. 1960). Her practice: the book as an object, where structure carries content — the 2,136-page SHV Think Book, die-cuts, page edges, paper weight as the design. Not imitating a specific book; taking her thinking: *one material decision, applied with rigour, and everything else gets out of its way.* |
| **Borrowed rules** | One ink + paper + black. A die-cut aperture that narrows as you descend. Side notes in the gutter, never in the text block. Folios and running heads are the only ornament. A text block that is visibly a smaller object sitting inside a large page. |
| **Form from content** | The name is a spatial promise — *inside* the triangles. Aperture = the reader's path inward to the bindu. And the stotram has two voices (verse vs commentary), so the page gets a margin column the way a critical edition does. |
| **Main material** | The artwork seen *through* the trikona; real Devanagari display (काली). |
| **Skeleton** | Single column, text block offset right of a gutter, one full-width aperture at the top cutting into the image. |
| **Boldness** | The aperture. Everything else is quiet to the point of severity. |
| **Palette** | bone `#E9E5DC` (ash) · ink `#15120F` · sindoor `#A8241C` · gold hairline `#8A6A2F`. *Argued:* ash from the cremation ground, vermillion from the sindoor on her forehead, ink from a printed stotram. Deliberately **cool** bone, not warm cream, and **vermillion**, not terracotta. |

## 2 · Best designer — Sugiura Kohei · **"The Yantra"**

| | |
|---|---|
| **Logic & source** | Sugiura Kohei (杉浦康平, b. 1932, Tokyo) — graphic designer and researcher of Asian iconography, whose subject *is* the mandala as an information structure ("Information Mandala"); ~5,000 books designed. Library specimen seen: `assets/style-specimens/east/08-sugiura-info-mandala.jpg`. |
| **Borrowed rules** | Concentric rings as the index, with numbered annotations on leader lines. Hairline gold rules. Monospace annotation at 11px. Red and gold on a warm near-black. Circle plus axis as the *only* geometry. |
| **Form from content** | Her yantra is literally a map — bhūpura, eight petals, circles, trikoṇa, bindu, entered outside-in. So the archive becomes the yantra: the pieces nearest the bindu are the ones most about her. |
| **Main material** | The bindu: a circular black-hole image, plus an SVG yantra drawn as a real constructible diagram. |
| **Skeleton** | Home = radial index (rings = āvaranas, four gates = the four deity hubs). Below the fold, a dense annotated archive. Reading page = verse column hung off a vertical gold axis, commentary in a second annotation column. |
| **Boldness** | The radial index — the one place the metaphor is allowed to be literal. |
| **Palette** | night `#0B0C12` (Kali's shyama, blue-black) · bone `#E7E1D2` · gold `#C4922B` · vermillion `#C33A28` · ash `#6C6A64`. *Argued:* her skin is *kāla*, blue-black; her ornaments are gold; the sindoor is vermillion. Not "dark mode with a neon accent" — the gold is ornament, the vermillion is mark. |

## 3 · Real reference — Emergence Magazine · **"The Long Read"**

| | |
|---|---|
| **Logic & source** | `emergencemagazine.org`, captured at `.huashu-design/refs/emergence.png` and looked at. What is actually there: a full-viewport photograph seen through a circular lens (an intricate diagram), 13px uppercase sans nav, an italic serif wordmark, one small overlaid caption block, no borders, no shadows. |
| **Borrowed rules** | Nav at 13px and quiet. One image owns the whole first screen. The wordmark is italic serif. Captions overlay in small sans. The only bright thing on the page is the image. |
| **Form from content** | The artwork is the strongest asset on this site and currently gets a 16:9 crop and a rounded corner. Give it the screen. |
| **Main material** | The full-bleed cosmic Kali image. |
| **Skeleton** | One screen = one image + one line. Scroll reveals the piece, then the index. |
| **Boldness** | Full-bleed image at 100vh. |
| **Palette** | near-black `#0A0A0A` · bone `#EDE8DE` · the image supplies the colour (muted, heavy vignette). |

## 4 · Real reference — The Public Domain Review · **"The Catalogue"**

| | |
|---|---|
| **Logic & source** | `publicdomainreview.org`, captured at `.huashu-design/refs/pdr.png` and looked at. What is actually there: hairline frames as the only container, a plate centred with a small caption, italic serif pull-quotes, small-caps labels, a right rail, high density held calm by ruling. |
| **Borrowed rules** | Hairline rules instead of cards. Italic serif for the secondary voice. Plate + caption as a unit. Dense, but ruled. |
| **Form from content** | There are 32 objects here, each with a provenance (deity, form, date, length). A collection, not a feed. |
| **Main material** | The altar series as catalogue plates. |
| **Skeleton** | Archive = ruled list with plate thumbnails. Reading page = plate + colophon. |
| **Boldness** | The ruling system, carried all the way through. |
| **Palette** | paper `#F4F1EA` · ink `#1A1815` · a single deep blue `#1F3A5F` for links. |

## 5 · Seconds roulette, web #15 — Utility-First Colorful Docs · **"The Index"**

| | |
|---|---|
| **Logic & source** | Style library **web #15** (drawn: second 54 → `54 % 20 + 1` = 15). The Tailwind-docs skeleton, restoration 98% in pure HTML. |
| **Borrowed rules** | Three columns: persistent left facet nav, centred prose measure, right in-page outline. Sticky chrome. Small type. Category colour-coding. |
| **Honest note** | The *skin* is wrong for this subject — rainbow category bars and a sky-gradient hero would be absurd. Only the skeleton is borrowed; the colour-coding is replaced by the four deities. If it survives, it survives as an information architecture, not as a look. |
| **Form from content** | The stotram commentaries *are* documents with an outline, and the right-hand column is where verse navigation lives. |
| **Main material** | None in the hero — the index itself, and the verse outline. |
| **Skeleton** | Three columns, faceted left, prose centre, outline right. |
| **Boldness** | The right-hand verse index. |
| **Palette** | near-white `#FBFBFA` · ink `#141414` · four deity colours used as 3px category marks only. |

## 6 · Seconds roulette, east #7 — Solar-Term Palette, executed as **"The Procession"**

| | |
|---|---|
| **Logic & source** | Style library **east #7**, drawn: `54 % 12 + 1` = 7. The Solar-Term colour band: a paper field, a horizontal row of colour bars with the current one enlarged and labelled, small stat blocks. Restoration 90%. |
| **Borrowed rules** | The horizontal band of marks where the current item **widens and becomes the accent** — and that band *is* the navigation. Colour organised by **name**, not by hex. |
| **Executed in** | The subject's own popular-print grammar: Kalighat pat and Bengali calendar art — flat saturated fills, heavy outlines, stacked display type, corner marks. Kalighat is the Kali tradition of popular print; the grammar is borrowed (flat colour, heavy outline, stacked type), **not** the painted figures. |
| **Form from content** | A devotional site is a procession: the pieces are carried past you in order, and the one you stop at takes the colour. Kali is worshipped in exactly this kind of street print — this is the tradition that already lives in the culture. |
| **Main material** | The flat red-disc silhouette; the procession band as the persistent object. |
| **Skeleton** | Full-bleed colour band header → sticky procession band → poster cards on a coloured field. Mobile: the band becomes a thumb-swiped strip, which is native to mobile. |
| **Boldness** | The band and the colour. The typographic grid underneath must be strict or this becomes chaos. |
| **Palette** | lamp black `#171512` · conch `#F2E8D6` · vermilion `#C43E24` · indigo `#22307A` · chrome yellow `#E5B01F`. *Argued:* the four-colour palette of Bengali devotional print on cheap paper. |

---

## The three chosen to build full

| | Why chosen |
|---|---|
| **1 · The Aperture** | Takes the brief literally — the triangles become the page. The quietest of the three, and the only one that would make the *writing* feel expensive. |
| **2 · The Yantra** | The only one that makes the archive itself the object of devotion. Highest risk, highest ceiling. |
| **6 · The Procession** | The only warm, loud, human one — and the only one whose navigation is right for a phone. Answers "discoverable and shareable" most directly. |

Different in light (bone / night / saturated), in structure (column+cut / radial rings / horizontal band),
in type voice (book serif / grotesque+mono / heavy display), and in temperature (quiet / intense / warm).
No two share an appearance family.

**Reserve, shown as thumbnails only:** 3 · The Long Read, 4 · The Catalogue, 5 · The Index.
