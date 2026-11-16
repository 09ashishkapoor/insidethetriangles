# polish-log.md

Review method: `polish.py shot` and `design_lint.py check` both require Python Playwright, which is not
installed in this environment (they skip with an install prompt). So every screen was reviewed the manual way
the skill allows: each page captured at 1440×900 and 390×844 as *successive viewport screens* (never one
squashed full-page image), opened and read, then fixed and re-shot. An automated audit re-checked horizontal
overflow, the smallest font sizes, and tap targets after every round.

Screens: `.huashu-design/shots/1a`, `1b`, `2a`, `2b`, `3a`, `3b` (desktop), `1a-mobile`, `2a-mobile`,
`3a-mobile`. Final singles: `.huashu-design/shots/final-*.png`.

---

## Round 1 → 2 · Direction 1, The Aperture

**The three worst things I saw**

1. **The hero headline was invented.** I had written "The night is not empty. She is in it." — a line the
   author never wrote, in an author's voice that is entirely his own. Replaced with his own sentence from the
   Tandava commentary: *"The fearsome destroyer is also the ultimate giver of grace."* Attribution under it.
2. **Doubled rules everywhere.** The contents list, the verse plate and the footer each ended in a 1px rule
   while the next section opened with another, leaving 40–50px blank *between two lines* — it read as a
   printing error, not a device. Reduced to one rule per transition.
3. **`महाकाल` ran into the word "Mahakala".** A 34px Devanagari name in a 76px column. Restructured the
   deity entries to stack (Devanagari above the Latin name) — also removes the width limit for any name.

Also fixed: the h1 had one word in italic + red ("She") — exactly the "colour one word in the heading"
template move; removed. Catalogue numbers were off by one against the real archive; recomputed from the
post dates (31, 30, 25, 22, 15, 9). Uppercase mono labels changed to sentence case where they were decorative
rather than functional.

**Mobile (390)**: the aperture was invisible — a grid item with `margin:0 auto` and `max-width` loses its
stretch, so `aspect-ratio` computed against a zero content width. Fixed with an explicit `width:100%`.
The nav wrapped "About" onto a second line; now a single scrollable row.

## Round 2 · Direction 2, The Yantra

**The three worst things**

1. **The lotus read as eight blobs.** My petal path was 74px long by 88px wide — nearly circular. Rebuilt the
   path narrower and longer (86 × ~50) so the eight petals read as a ring.
2. **Labels were punched through by the axis and the square.** The cardinal labels sat on the bhūpura's edge
   and the horizontal axis ran through their text. Moved them outside the geometry entirely and cut them to a
   legend — `01 adya ma`, `02 bhairava`, `03 mahakala`, `04 the archive` — with the roles named in the column
   beside it. The Yantra's own rule (enter from the outer frame inward) does the explaining.
3. **The IAST verse wrapped mid-line.** `max-width:34ch` on a 25px verse forced the danda onto a line of its
   own. Removed the cap; the author's own line breaks now control the measure.

Also fixed: the mobile top bar put a scrollable nav under a fixed 52px bar and clipped it — the bar now wraps
to two rows; the four gate labels are hidden below 860px and the numbered gate list carries the navigation
instead.

## Round 2 · Direction 3, The Procession

**The three worst things**

1. **The header's left edge was off-screen on mobile.** `.head-in` set `padding:16px 0 14px`, which
   silently killed the `.wrap` horizontal padding on the same element, so काली began at x=0 and lost a stroke.
   Split into `padding-top` / `padding-bottom`; same bug fixed in the footer.
2. **The featured poster was 840px tall.** Its art column had `aspect-ratio:auto` with a portrait source, so
   the row height came from the image's natural ratio and left a column of dead space beside it. Constrained
   the art to 4/3.
3. **The poem broke mid-line** ("I / stand") because the verse box was 24ch. Widened to 38ch so the four
   lines break where the poet broke them.

Also: the standfirst on vermilion was 4.2:1 — under the 4.5 body floor. Darkened the vermilion from `#C43E24`
to `#B8381F` (4.75:1) rather than change the text.

## Cross-cutting, all three

- **Every label under 12px was raised to 12px, and every body size under 14px to 14px.** 71 declarations
  across the three stylesheets. Re-audited: no horizontal overflow, no sub-12px text left.
- **Mobile tap targets**: primary nav links, the stotram verse strip and the margin indexes were 19–37px tall;
  now ≥44px on the nav and the verse strip at 390px.
- **The danda.** `।` rendered as a slanted stroke inside italic Latin lines (two different serifs, same
  result). Replaced with a 3.2–3.5px rule drawn in `currentColor`, with the character left in the DOM for
  screen readers. Deterministic at any size.

## Known, not fixed (needs the author)

- The Tandava cover in the archive is a photograph watermarked **"Trust With Kaali – Praveen Radhakrishnan"**.
  It is not used in any hero position in these drafts, but it should not stay as a post cover without
  permission or replacement.
- Devanagari verse text does not exist in the archive yet; the drafts show IAST only, and the reading rail
  says so.
- The deity grouping (Bhairava 12 / Adya 11 / Kali 6 / Mahakala 2) is derived by keyword frequency, not by
  the author. It needs his mapping before it ships.
