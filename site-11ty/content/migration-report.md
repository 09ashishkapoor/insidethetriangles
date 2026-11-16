# Migration report — the 32 existing posts

**Baseline:** 2026-11-15. The generated report this replaces is frozen at
[`migration/migration-report.before.md`](../../migration/migration-report.before.md). Nothing in `src/posts/`
has been rewritten. This is the one list to approve or correct before Phase 2.

**Approved 2026-11-15.** The author approved Table 1 — form, deity, confidence and excerpt for all 32 — as
written, including the `check` rows and the blocked image-only post. Table 2 records the exact body conversion
and the image for each post. Section 5 lists the four places where the contract and the archive disagree; those
are implementation decisions for Phase 2, not taxonomy changes. The Devanagari text, the Tandava image
permission and the image-only post still need the author.

## How to read this

- **Slug is frozen.** The `slug` column is the existing entry ID and therefore the existing URL. No title or
  slug changes are proposed; 32/32 must resolve to the same `/posts/<slug>/`.
- **Vocabulary only.** `deity` and `form` come from `site-11ty/content/vocabulary.json`. No new values are
  proposed. If a piece is about a deity the vocabulary does not contain (Matangi, Skanda, Parvati, Durga),
  that is flagged — not silently mapped.
- **Confidence.** `ok` = the post's own text supports the value; `check` = one plausible reading, author must
  confirm; `unknown` = no basis in the text. Low confidence is deliberate.
- **Form rule.** Verse → `poem`; a hymn with verse/translation/commentary → `stotram`; site news → `update`;
  prose under ~600 words → `short`; prose over ~600 words → `long`. Six old `long articles` fall under 600
  words and are proposed as `short`; see §3.
- **Excerpts are derived, not invented.** Every excerpt is a verbatim phrase, a joined pair of verse lines, or
  a verbatim sentence from that post. `/` represents a line break inside verse; it is not a new word. The one
  post with no body has no excerpt, and is marked blocked.
- **Images.** Bytes are exact on disk. “No credit watermark” means no visible licensing/credit line at the
  resolution reviewed; some AI plates carry generated signatures or in-art text (for example the two
  “Bhairava” title plates). The one licensing watermark is the Tandava cover.

## 1 · Approval table — form, deity, excerpt

| # | slug | title | form | deity | conf | excerpt |
|---:|---|---|---|---|---|---|
| 1 | `adya-ma-my-mother-divine` | Adya Ma, My Mother Divine | poem | adya | ok | Adya Ma, O Mother true, / You are the sky’s endless blue. / Before all gods and time began, / You held the world within Your hand. |
| 2 | `adya-ma-the-primordial-mother` | Adya Ma: The Primordial Mother | poem | adya | ok | In silence before creation’s dawn, / She sits, unseen, unknown, unborn; / Beyond Devaloka’s veiled gaze, / The origin none can trace or phrase. |
| 3 | `adya-the-originless-one` | Adya: The Originless One | poem | adya | ok | In the hush between thought and breath, / Where silence deepens beyond death, / There rises a shadow clothed in night / Adya Ma, primordial light. |
| 4 | `adyas-call` | Adya's Call | poem | adya | ok | Beyond the forms you seek, I stand / Adya, the first, the flame unplanned. / No shrine yet holds My true face, / No chant confines My boundless grace. |
| 5 | `be-a-child-in-the-lap-of-ma-kali` | Be a Child in the lap of Ma Kali | short | kali | ok | To live authentically, cultivate the innocence of a child, a state achievable through devotion (sadhana) to Ma Kali. |
| 6 | `bhairava-nama-japa-2` | Bhairava - Nama Japa | short | bhairava | ok | Bhairav Nama Japa is no doubt powerful, but its effectiveness depends on your ability to visualize. |
| 7 | `bhairava-no-fear-2` | Bhairava No Fear | short | bhairava | ok | Bhairava epitomizes the destruction of rigid systems and taking the shape of Brahma’s fifth head. |
| 8 | `bhairava-the-light-within` | Bhairava - The Light Within | poem | bhairava | check | Sun guides the way, / Darkness fades away. / Heart finds its flame / No chains can tame. |
| 9 | `bhairava-the-veil-keeper` | Bhairava: The Veil keeper | poem | bhairava | ok | Oh, fierce one, with eyes that flash like thunder, / A tempest in form, yet a gentle heart under. |
| 10 | `bhairava-unbound` | Bhairava, Unbound | poem | bhairava | ok | No one owns Bhairava / He rises from Shiva’s third eye, / a flash against the pride of Brahma, / headless ego rolling in dust. |
| 11 | `bhairavas-call` | Bhairava’s Call | poem | bhairava | ok | Fearless Bhairava, dark and bright, / Shiva’s anger, Shiva’s light. / Dog beside you, fierce and true, / You protect the ones who kneel to you. |
| 12 | `embracing-simplicity-and-devotion-in-kali-yuga-a-path-forward` | Embracing Simplicity and Devotion in Kali Yuga: A Path Forward | short | adya + kali | ok | Ma Adya demands no rigid rituals only Sampoorna Bhakti (complete devotion). She’s the “architect of all Shaktipeethas,” yet gives no strict instructions. |
| 13 | `home-your-sacred-ground` | Home - Your Sacred Ground | long | mahakala | ok | Your asana [practice space] is everything. Every form of the deity will come to your asana. |
| 14 | `jai-maa-adya` | Jai Maa Adya | update | adya | ok | The blog/website was setup with aadesh from Ma. She wants me to write and this is where its going to be. |
| 15 | `just-getting-started` | Just Getting Started | update | — | unknown | This is Insidethetriangles, a brand new blog/site by KaliPutra_AshishKapoor that's just getting started. |
| 16 | `kalabhairava-ashtakam-breakdown-of-verses-with-commentary-in-english` | Kalabhairava Ashtakam: Breakdown of Verses with Commentary in English | stotram | bhairava | ok | Kalabhairava Ashtakam, attributed to the great philosopher-saint Adi Shankaracharya ji, is a masterpiece of devotional poetry. |
| 17 | `kali-is-krishna-is-kali` | Kali is Krishna is Kali | **— (blocked)** | kali | check | **— no body text** |
| 18 | `maa-adya-the-red-pill-2` | Maa Adya : the red pill | poem | adya | ok | Adya Ma's fiery gaze comes down / A transformative energy that knows no bound / She cuts through my ego's tangled threads |
| 19 | `mahakala-and-kalabhairava-simplified-2` | Mahakala and KalaBhairava - Simplified | short | mahakala + bhairava | ok | Mahakala is complete latent passive lying energy mass. This is Shiva's complete energy lying latent, it doesn't move. |
| 20 | `navigating-spiritual-uncertainty-embracing-collapse-and-transformation` | Navigating Spiritual Uncertainty: Embracing Collapse and Transformation | short | bhairava | ok | Ever felt torn between conflicting spiritual experiences, like one day you’re soaring, the next you’re stuck in fog? |
| 21 | `navigating-the-dance-of-material-and-spiritual-a-path-through-divine-feminine-wisdom` | Navigating the Dance of Material and Spiritual: A Path Through Divine Feminine Wisdom | short | kali + bhairava | check | The tension between worldly pursuits and spiritual growth isn’t unique to modern life, it’s a universal human experience. |
| 22 | `ode-to-adya-ma` | Ode to Adya Ma | poem | adya | ok | Adya Ma, the ancient one, / Source of all, beyond the sun. / Goddesses arise from you / Kali, Sita, forms anew. |
| 23 | `ode-to-adya-maa-from-a-ganda-bacha-wayward-child` | Ode to Adya Maa from a Ganda bacha (wayward child) | poem | kali + adya | check | Kali Ma Kali Ma Kali Ma ami tomar andha bhakta tumi amar shonu Ma. But it was always you Adya Ma, I realize that now. |
| 24 | `shri-kali-tandava-stotram-translation-and-commentary` | Shri Kali Tandava Stotram: Translation and Commentary | stotram | kali + bhairava | ok | To Her who resounds with the primordial sound "Huṃ," who is mounted upon a lifeless form (śava), whose eyes are like blue lotuses. |
| 25 | `skanda-the-storm` | Skanda the Storm | poem | bhairava | check | Spear in hand, fire in eyes, / Son of Shiva, lightning skies. / Peacock dances, snakes bow low, / Warrior’s wrath, swift as arrow. |
| 26 | `the-alchemy-of-desire-transforming-physicality-into-spiritual-mastery` | The Alchemy of Desire: Transforming Physicality into Spiritual Mastery | short | adya | check | Ever felt torn between your physical desires and spiritual aspirations? You’re not alone. |
| 27 | `the-eternal-dance-of-creation-and-destruction-maa-kali-and-parashuramas-cosmic-mission` | The Eternal Dance of Creation and Destruction: Maa Kali and Parashurama’s Cosmic Mission | short | kali | ok | There is a simple truth: Ma Kali is not just a deity of transformation, she is the force itself. |
| 28 | `the-green-weaver-of-shadows-2` | The Green Weaver of Shadows | poem | adya | check | She sits within the dust and stone, / A silent watcher, utterly alone. / Not seeking light, nor sun's embrace, / But holds the secrets of this place. |
| 29 | `the-reawakening-of-kanda-bhairava-sacred-order-and-cosmic-balance` | The Reawakening of Kanda Bhairava: Sacred Order and Cosmic Balance | long | bhairava | ok | Enter Kanda Bhairava, the guardian of divine order. He’s not a distant myth, but a force tied to sacred spaces like Ma Kamakhya Peetha. |
| 30 | `the-serpents-heart` | The Serpent’s Heart | poem | bhairava | ok | From churning darkness, a fiery birth, / Bhairava rises, a chaotic worth. / Not gentle solace, a soothing plea, / But raw intensity, eternally free. |
| 31 | `the-timeless-path-of-kand-bhairava-awakening-to-the-tantric-truth-2` | The Timeless Path of Cand Bhairava: Awakening to the Tantric Truth | short | bhairava | ok | The ancient wisdom of Lord Karthikeya offers a timely response to this modern struggle. |
| 32 | `update-migration-complete-2026-03-30` | Update — 11ty migration complete | update | adya | check | This website is not abandoned — 11ty migration from Ghost is complete. More content coming soon. |

Counts after this table: **14 poem · 10 short · 2 long · 2 stotram · 3 update · 1 blocked**.
Primary deity: **Adya 11 · Bhairava 12 · Kali 6 · Mahakala 2 · none 1**. Confidence: **23 ok · 8 check · 1 unknown**.

## 2 · Body conversion and image

The exact conversion is the work Phase 2 must do to each file. “No text change” means the conversion only moves
the same words between HTML and Markdown; it does not correct spelling, spacing or punctuation.

| # | slug | exact body conversion | image |
|---:|---|---|---|
| 1 | `adya-ma-my-mother-divine` | Ghost `<p>/<br>` verse → line-based; 4 stanzas; final `Jai Ma Adya` line. No text change. | `/images/2025/06/Image_fx---2025-05-29T234539.924.jpg` · 1.80 MiB · no credit watermark |
| 2 | `adya-ma-the-primordial-mother` | Ghost `<p>/<br>` verse → line-based; 9 stanzas. Preserve `sits,unseen` in the body; excerpt adds the missing space (see §6). | `/images/2025/04/ma-adya-primordial-mother.png` · 347.3 KiB · no credit watermark |
| 3 | `adya-the-originless-one` | Ghost `<p>/<br>` verse → line-based; 9 stanzas. No text change. | `/images/2025/04/6d15c9bb-69fb-4a58-addd-8d37315947cf.png` · 500.1 KiB · no credit watermark |
| 4 | `adyas-call` | Ghost `<p>/<br>` verse → line-based; 5 stanzas. No text change. | `/images/2025/06/Image_fx---2025-05-29T234549.330.jpg` · 1.68 MiB · no credit watermark |
| 5 | `be-a-child-in-the-lap-of-ma-kali` | Ghost `<p>` prose → Markdown; one paragraph plus the Guru Praveen credit. No text change. | `/images/2025/06/Image_fx---2025-06-03T173925.669.jpg` · 984.1 KiB · no credit watermark |
| 6 | `bhairava-nama-japa-2` | Ghost `<p>` prose → Markdown; `<strong><em>` runs → `***…***`; preserve the leading space inside “ Specificity” by moving it outside the markers. No text change. | `/images/2025/06/upscaled_410t74szxxxxx.jpg` · 375.5 KiB · in-art “Bhairava” title, no credit watermark |
| 7 | `bhairava-no-fear-2` | Ghost `<p>` prose → Markdown. No text change. | `/images/2025/06/Hanuman_in_meditation_posture__20250504_172213_img1_3.png` · 1.09 MiB · no credit watermark |
| 8 | `bhairava-the-light-within` | Ghost `<p>/<br>` verse → line-based; 3 four-line stanzas plus the two closing invocations; drop the empty `<p></p>`. No text change. | `/images/2025/07/zxc.png` · 2.65 MiB · no credit watermark |
| 9 | `bhairava-the-veil-keeper` | Ghost `<p>/<br>` verse → line-based; one 20-line verse stanza plus the closing `Om Adyaye Namah`. No text change. | `/images/2025/07/upscaled_oqfwv3zo.jpg` · 187.5 KiB · no credit watermark |
| 10 | `bhairava-unbound` | Ghost `<p>/<br>` verse → line-based; 4 verse stanzas plus the two closing invocations. No text change. | `/images/2025/04/164a4c8e-5de4-4a53-be78-d54de87f071d.png` · 484.4 KiB · no credit watermark |
| 11 | `bhairavas-call` | Ghost `<p>/<br>` verse → line-based; 5 stanzas. No text change. | `/images/2025/04/361cbf95-8a78-4aeb-a3fe-d4117ffad638.png` · 535.0 KiB · no credit watermark |
| 12 | `embracing-simplicity-and-devotion-in-kali-yuga-a-path-forward` | Ghost `<p>/<br>` section labels + prose → Markdown; `<strong>Label</strong><br>` → `**Label**\` + hard break; `<em>` → `*`; no headings invented. No text change. | `/images/2025/07/upscaled_bxmubeo5.jpg` · 480.4 KiB · no credit watermark |
| 13 | `home-your-sacred-ground` | Ghost HTML → Markdown; five `<h2>` → `##`; `<p>`, `<strong>`, `<em>`, `<ol>/<li>` → numbered list. No `<br>`. No text change. | `/images/2025/06/20250608_2325_Cyberpunk-Yantra-Altar_simple_compose_01jx9bf514ep6rt8fxx5tqgcqa.jpg` · 148.8 KiB · no credit watermark |
| 14 | `jai-maa-adya` | Ghost `<p>` prose → Markdown. No text change. | `/images/2025/06/upscaled_6l6vlb7vnnn.jpg` · 300.9 KiB · in-art “Bhairava” title, no credit watermark |
| 15 | `just-getting-started` | Ghost `<p>` prose → Markdown. The `#/portal/` link is preserved exactly and flagged: it is a Ghost portal route, dead on a static site. No text change. | **none** |
| 16 | `kalabhairava-ashtakam-breakdown-of-verses-with-commentary-in-english` | Ghost HTML → stotram blocks: 9 `## Verse N`; `**Sanskrit:**` lead-in; IAST blockquotes; `Translation`/`Commentary` labels; `Verse 9 (The Phala Shruti - Verse of Benefits)` split into `## Verse 9` + an italic line; 12 `<hr>` dropped. **Requires the label decision in §5.2.** No IAST change. | `/images/2025/11/kalabhairava.png` · 2.10 MiB · also favicon/Organization logo · no credit watermark |
| 17 | `kali-is-krishna-is-kali` | **Blocked.** There is no body: only front matter and a feature image whose own text reads “KALI IS KRISHNA IS KALI”. No current form accepts an empty body (`body` required) or an empty excerpt. Author must supply text or approve an image-only form. | `/images/2025/06/kali-is-krishna-is-kali--35--1.png` · 1.47 MiB · no credit watermark |
| 18 | `maa-adya-the-red-pill-2` | Ghost `<p>/<br>` verse → line-based; one 14-line stanza. No text change. | `/images/2025/03/2371fb4e-510b-4098-a079-6e2b5afd6345-1.png` · 466.3 KiB · no credit watermark |
| 19 | `mahakala-and-kalabhairava-simplified-2` | Ghost `<p>` prose with `<br>` → Markdown; three hard breaks; `<blockquote><p>` + `<br>` → `>` quote with two lines. No text change. | `/images/2025/07/upscaled_7gqwxv7j.jpg` · 364.1 KiB · no credit watermark |
| 20 | `navigating-spiritual-uncertainty-embracing-collapse-and-transformation` | Ghost `<p>/<br>` section labels + prose → Markdown; five `**Label**\` hard breaks; `<em>` → `*`. No text change. | `/images/2025/07/upscaled_473p8dal.jpg` · 508.7 KiB · no credit watermark |
| 21 | `navigating-the-dance-of-material-and-spiritual-a-path-through-divine-feminine-wisdom` | Ghost `<p>/<br>` section labels + prose → Markdown; six hard breaks; `<em>` → `*`. No text change. | `/images/2025/07/sad.jpg` · 1.60 MiB · no credit watermark |
| 22 | `ode-to-adya-ma` | Ghost `<p>/<br>` verse → line-based; 5 stanzas. No text change. | `/images/2025/06/Image_fx---2025-05-29T234232.931.jpg` · 1.67 MiB · no credit watermark |
| 23 | `ode-to-adya-maa-from-a-ganda-bacha-wayward-child` | Ghost `<p>/<br>` verse/prose hybrid → line-based; 9 stanzas; Bengali transliteration preserved exactly. No text change. | `/images/2025/03/2be46b48-a997-4700-9ce8-c7d6e33cc41da.png` · 413.2 KiB · no credit watermark |
| 24 | `shri-kali-tandava-stotram-translation-and-commentary` | Ghost HTML → stotram blocks: 9 `## Verse N`; IAST blockquotes; `Translation`/`Commentary` labels; `## Introduction`/`## Conclusion` as non-verse headings; 13 `<hr>` dropped. **Requires the loader note in §5.3.** No IAST change. Example: `migration/examples/stotram-tandava.*`. | `/images/2025/11/uywjs16z45454.jpg` · 69.6 KiB · **WATERMARKED** “Tryst With Kaali – Praveen Radhakrishnan” |
| 25 | `skanda-the-storm` | Ghost `<p>/<br>` verse → line-based; 5 stanzas; final `<strong>Jai Canda Bhairava</strong>` → `**…**`. No text change. | `/images/2025/06/2025-06-03_17-12-00_5450.png` · 1.26 MiB · no credit watermark |
| 26 | `the-alchemy-of-desire-transforming-physicality-into-spiritual-mastery` | Ghost `<p>/<br>` section labels + prose → Markdown; five hard breaks; `<em>` → `*`. No text change. Example: `migration/examples/prose-alchemy-of-desire.*`. | `/images/2025/07/upscaled_zmpjyc1r.jpg` · 506.5 KiB · no credit watermark |
| 27 | `the-eternal-dance-of-creation-and-destruction-maa-kali-and-parashuramas-cosmic-mission` | Ghost `<p>/<br>` section labels + prose → Markdown; seven hard breaks; `<em>` → `*`. No text change. | `/images/2025/07/12sss.png` · 1.71 MiB · no credit watermark |
| 28 | `the-green-weaver-of-shadows-2` | Ghost `<p>` lines with no `<br>` → line-based; each `<p>` is a one-line stanza (18). Preserve the accidental split between “She doesn't judge…” and “She nutures…”; see §5.4. No text change. Example rule: `migration/examples/poem-serpents-heart.*`. | `/images/2025/07/dsf.jpg` · 1.83 MiB · no credit watermark |
| 29 | `the-reawakening-of-kanda-bhairava-sacred-order-and-cosmic-balance` | Ghost HTML → Markdown; five `<h3>` → `###`; paragraphs; `<em>`; no `<br>`. The malformed sentence “neither divine intervention nor Understanding Kanda Bhairava” is preserved verbatim (see §6). No text change. | `/images/2025/07/Image_fx---2025-06-18T142058.918.jpg` · 1.87 MiB · no credit watermark |
| 30 | `the-serpents-heart` | Ghost `<p>/<br>` verse → line-based; 6 stanzas; drop the empty `<p></p>`; closing invocation. No text change. Example: `migration/examples/poem-serpents-heart.*`. | `/images/2025/07/321.png` · 1.37 MiB · no credit watermark |
| 31 | `the-timeless-path-of-kand-bhairava-awakening-to-the-tantric-truth-2` | Ghost `<p>/<br>` section labels + prose → Markdown; five hard breaks; `<em>` → `*`. No text change. | `/images/2025/07/121213.jpg` · 1.53 MiB · no credit watermark |
| 32 | `update-migration-complete-2026-03-30` | Ghost `<p>`, `<ul>/<li>`, `<a>` → Markdown; preserve the three external URLs exactly. No text change. | `/images/2026/03/update-2026-03-30.jpg` · 271.0 KiB · no credit watermark; card `/images/2026/03/update-2026-03-30-card.jpg` · 98.2 KiB |

## 3 · What changed from the generated report

The generated report was keyword-derived. These are the corrections; they are the part most worth checking.

**Forms.** The generated report inherited the old tags, which are not reliable.

- Six posts are under the contract's ~600-word line and are proposed as `short`: three old `long articles` — `embracing-simplicity…` (414 words), `the-alchemy-of-desire…` (484), `the-timeless-path…` (490) — and three untagged prose posts — `navigating-spiritual-uncertainty…` (520), `navigating-the-dance…` (572), `the-eternal-dance…` (576).
- Two old `long articles` stay `long`: `home-your-sacred-ground` (599 — the boundary) and `the-reawakening…` (700).
- Three site-news posts become `update`: `jai-maa-adya`, `just-getting-started`, `update-migration-complete-2026-03-30`.
- The nine posts with no form now have one, except the blocked image-only post: `adyas-call` (poem), `bhairava-the-light-within` (poem), `kali-is-krishna-is-kali` (**blocked**), `mahakala-and-kalabhairava-simplified-2` (short), `navigating-spiritual-uncertainty…` (short), `navigating-the-dance…` (short), `the-eternal-dance…` (short), `the-green-weaver-of-shadows-2` (poem), `the-serpents-heart` (poem).

**Deities.** The generated report was right often enough to be useful and wrong in six places.

| post | generated | proposed | why |
|---|---|---|---|
| `navigating-the-dance…` | adya + kali | **kali + bhairava** | the piece is built on Battuka Bhairava / Ma Durga and MahakalaBhairava / Mahakali. “Adya” appears only in the sign-off `Om Adyaye Namah`. |
| `the-green-weaver-of-shadows-2` | adya | **adya** (`check`) | the piece is about **Matangi**, who is not in the vocabulary. `adya` is the only honest mapping (the source of the Mahavidyas) and is flagged. |
| `ode-to-adya-maa-from-a-ganda-bacha…` | kali | **kali + adya** | the title says Adya; the text addresses Kali and then says “it was always you Adya Ma”. Two keys, Kali primary. |
| `the-alchemy-of-desire…` | adya (`check`) | **adya** (`check`) | kept, but for a different reason: the piece is about Parvati/Shakti, who is not in the vocabulary. Flagged. |
| `skanda-the-storm` | bhairava (`check`) | **bhairava** (`check`) | the poem is about Skanda/Karthikeya; the only Bhairava link is the closing `Jai Canda Bhairava`. Flagged. |
| `just-getting-started` | — | **— (`unknown`)** | no deity anywhere in the text. Do not invent one; the author must choose or the vocabulary must allow “none” for site updates. |

**Mahakala is not folded.** `home-your-sacred-ground` and `mahakala-and-kalabhairava-simplified-2` keep the
`mahakala` key because both texts are explicitly about Mahakala/Mahakaleshwara. The approved design reads
Mahakala inside Bhairava; that is a **presentation** decision, not a reason to erase the key. Confirm this; do
not silently merge it during the port.

**Excerpts.** 31 of 32 now have one. The audit counted 29 as missing; two more existed but were below the
40-character minimum (`first post`, `welcome to the blog`). `kali-is-krishna-is-kali` cannot have one because
it has no body.

## 4 · Conversion size

- **16 verse bodies** need the `<p>/<br>` → line-based conversion: 14 poems + 2 stotrams. The old
  `content:check` reported 12 because four of those posts had no form and were skipped; after this table the
  real count is 16.
- **15 prose bodies** need Ghost HTML → Markdown: 10 short + 2 long + 3 update.
- **1 body is blocked**: `kali-is-krishna-is-kali`.
- **No post needs a URL change.** All 32 slugs above are the current slugs.

## 5 · Where the contract and the archive disagree

These need a decision before the normalizer runs. None is a reason to guess.

### 5.1 `kali-is-krishna-is-kali` has no body

The file is front matter plus a feature image. The image itself contains the title text. The contract requires
a body and an excerpt; no current form accepts an image-only post. Options: the author supplies a body, or
Phase 2 adds an explicit image-only form (a new vocabulary value, not a silent exception). Until then this one
post cannot be migrated.

### 5.2 The Ashtakam's “Commentary and Intricacies:” label

Every verse in `kalabhairava-ashtakam…` uses `<h3>Commentary and Intricacies:</h3>`. The validator requires
`**Commentary.**` (or `**Commentary:**`) exactly; `**Commentary and Intricacies:**` does **not** match. Three
choices:

1. normalize the label to `**Commentary.**` — loses the words “and Intricacies”;
2. keep the full label and extend the validator/renderer to accept a `**Commentary …**` lead-in;
3. keep the heading as `### Commentary and Intricacies` after the required `**Commentary.**` marker — keeps
   both, but repeats “Commentary”.

Recommendation: **2**, because it is the only option that loses nothing. It is a Phase 2 schema change, not a
Phase 1 rewrite.

The same post also has `<p><strong>Sanskrit:</strong></p>` before each blockquote. The current `renderStotram`
puts non-quote lines *after* the blockquote, so the label would move. The Phase 2 loader must either support a
lead-in before the quote or the author must approve dropping the “Sanskrit:” label. Recommendation: support the
lead-in; the word is part of the text.

### 5.3 The Tandava's Introduction and Conclusion

`shri-kali-tandava…` has `<h2>Introduction…</h2>` and `<h2>Conclusion</h2>` in addition to the nine
`## Verse N` headings. The current `renderStotram` only recognizes `## Verse N`; any other `##` becomes a
literal paragraph. The Phase 2 loader must render non-verse `##` headings as headings (the example assumes
this). No text is lost; the current renderer is simply incomplete.

### 5.4 The Green Weaver's split sentences

`the-green-weaver-of-shadows-2` has each sentence in its own `<p>`, and two fragments are split across
paragraphs:

> She doesn't judge, she doesn’t strive
>
> She nutures the things that live Within the spaces, dark and low…

Preserving `<p>` boundaries makes them separate one-line stanzas. Joining them would change a line break. The
conversion preserves the split; the author should confirm whether they are one stanza. “nutures” is preserved
as written.

## 6 · Typo and spacing candidates — flagged, not fixed

The normalizer must not silently copy-edit. These are the visible candidates; the body conversion preserves
them exactly, and the excerpt for #2 is the one place a missing space was added for readability.

- `adya-ma-the-primordial-mother`: `sits,unseen` (missing space).
- `adyas-call`: `Peethas;I designed` (missing space after the semicolon).
- `bhairava-nama-japa-2`: `Lets` (apostrophe), `mantra's` (straight apostrophe), a leading space inside
  `<strong><em> Specificity…`.
- `the-green-weaver-of-shadows-2`: `nutures`.
- `the-reawakening…`: “…neither divine intervention nor Understanding Kanda Bhairava” — the sentence is
  truncated in the source.
- Several prose posts lost the space after a period or clause in Ghost: `control,it’s`, `birth.“Just`,
  `optional;it’s`, `explains“The`, `truth.“There`, `loss,it’s`, `upheaval,it’s`, `beam,a shift`. These are
  preserved. They are editor work for the author, not migration work.

## 7 · What has not been touched

`src/posts/`, `public/`, and `design-demos/` are unchanged. No post was rewritten, no image moved, no
dependency installed. The examples live in `migration/examples/`; the URL baseline is
`migration/url-parity.json`; the image inventory is `migration/image-inventory.md`. Public behaviour, tests and
the build are still the 32-post Eleventy site.
