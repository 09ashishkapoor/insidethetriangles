# Technology refresh — the tradeoffs, and my recommendation

You asked to see the tradeoffs rather than a verdict, so here they are. Then a verdict, because a
comparison without one is a bibliography.

## What is actually wrong today

Ranked by how much it costs you. Note that **the framework is fourth on this list**, not first.

| # | Problem | Evidence | Cost |
|---|---|---|---|
| 1 | **Images ship at full weight.** No srcset, no AVIF/WebP, no width caps. `public/` is passthrough-copied. | 41.9 MB of images; `upscaled_04tv5co1.png` is 4.3 MB and lands in a 740 px column | Largest-contentful-paint on mobile is bad and unfixable with CSS. Worst on the pages you most want shared. |
| 2 | **Front matter is unvalidated and inconsistent.** 11 of 32 posts have no `tags` at all; the other 21 use four different tag vocabularies. | `design_lint` on the repo; the tag grouping script found `["Poems"]`, `["long articles"]`, `["short articles"]`, `["updates"]`, and nothing | The `Poems` page silently omits untagged poems. Nothing tells you; the build succeeds. |
| 3 | **Post bodies are raw Ghost HTML.** `<p>` with `<br>` for verse, `kg-*` classes for cards, escaped braces. | `src/posts/*.md` | Verse can't be typeset properly by template — only by CSS hacks on `<br>`. Blocks the single best content design decision. |
| 4 | **Template layer is one 749-line CSS file with duplicate dark-mode blocks.** | `src/css/style.css` lines 33–54 *and* 715–749 both define dark values | Every design change is a global edit. Themes can't be scoped. |
| 5 | **"Related posts" is not related.** It returns the first three posts chronologically. | `post.liquid` lines 61–67 | Every page advertises the migration notice. |
| 6 | No pagination, no search, no archive. `/articles/` renders all 32 cards on one page. | `articles.liquid` | Fine at 32 posts. Not fine at 80. |

**The honest conclusion:** #1, #2 and #3 are content-and-build problems. Astro does not fix them for you —
it makes #2 structurally impossible to get wrong and #1 trivial, but #3 is a *writing-format decision*
(do we convert the Ghost HTML to Markdown?) that no framework will make for you.

## The options

### A — Stay on Eleventy 3, modernise it
Add `@11ty/eleventy-img` (responsive AVIF/WebP + width sets), split `style.css` into token/base/layout/component
layers, add a front-matter sanity check in `eleventy.config.js`, fix related-posts to use shared tags.

- **Effort:** 1–2 days.
- **Risk:** very low. Nothing moves. Your CI and 4 Playwright suites keep working; only visual baselines need regenerating.
- **Gets you:** the 41.9 MB problem solved (likely 3–6 MB per page → 200–500 KB), tokenised CSS, honest related posts.
- **Doesn't get you:** typed content, component ergonomics, an easier path to search/audio. Front matter stays untyped — you can add a validation script but it's a bolt-on, not a guarantee.
- **Note:** `@11ty/eleventy-img` needs sharp, which needs a native binary — fine on Cloudflare Pages and on your Windows machine, but it's the one piece that can bite CI (the workflow runs on `windows-latest`).

### B — Move to Astro 5 — **my recommendation**
Content collections with a Zod schema per collection (`posts`, `poems`, `stotram`), built-in `<Image>`/`<Picture>`
with sharp, scoped styles, MDX available later if you want verse components.

- **Effort:** 3–5 days including migrating 32 posts and 5 templates.
- **Risk:** medium, and mostly mechanical. All 32 markdown files are already front-matter-compatible; permalinks
  and slugs are explicit, so URLs can be preserved exactly (this is the thing that would actually hurt — 32 URLs
  losing their SEO). Output is still static HTML on Cloudflare Pages; no adapter change needed.
- **Gets you:** the image pipeline as a default (not an add-on), **front matter that fails the build when wrong**
  — which is exactly the class of bug that has been silently hiding 11 posts from `/poems/` — and components, so the
  verse block becomes `<Verse n="1" iast="…">` rather than a CSS hack.
- **Doesn't get you:** anything about the writing experience. And it does not fix #3 for you.
- **What it costs you:** your Playwright suite needs its config ported (small), and the Liquid templates are rewritten
  (that's the actual work — but I'm rewriting them anyway for the redesign).

### C — Astro + a git-based CMS (Decap / Sveltia)
B on top of a writing UI at `/admin`, committing to the repo via GitHub OAuth.

- **Effort:** B + 1–2 days, plus an ongoing auth/maintenance surface.
- **Only worth it if** the friction is *"I avoid writing because publishing means editing a markdown file."*
  Your bodies are hand-polished HTML with `<br>` verse — a rich-text CMS will mangle exactly the thing that's
  hardest to get right. I'd rather give you a **verse shorthand in Markdown** (`||` for line breaks, blank line for
  stanza) than a WYSIWYG. Say the word and I'll propose that instead.

### D — Next.js / SvelteKit / Hugo
Not recommended, at different lengths.

- **Next.js / SvelteKit:** you are adding a server-capable framework with hydration to a 32-post static archive with no
  interactive features. Every gain is available without it; you'd pay in complexity and in a build that is slower to
  reason about. If the site ever needs accounts or comments, revisit.
- **Hugo:** a lateral move from Eleventy — same class of tool, different template language, all the design work redone
  for no new capability.

## Recommendation

**Do B, but sequence it so the design leads.**

1. **Redesign first, on the current Eleventy site.** The design is the thing you'll actually see, and the three
   directions I've built are static HTML — they are framework-agnostic. Pick one.
2. **Then migrate to Astro as the implementation vehicle for that design.** Moving framework *and* finding the design
   at the same time is how projects stall: you can't tell whether a bad page is a bad design or a bad port.
3. **Do the content pass before the framework pass.** Convert the 32 Ghost bodies to clean Markdown (poems to a
   line-based verse format, stotrams to the repeating verse block), and formalise the taxonomy
   (deity + form). This is the work that unlocks the reading design, and it's identical in either framework.
4. **Keep the tests.** Port the four Playwright suites and regenerate the visual baselines once, after the design is
   locked. Losing the a11y/perf gates would be a bigger regression than staying on Eleventy.

If you'd rather not take on a migration at all, **A is a perfectly good outcome** — you'd get ~90% of the visible
benefit for a fifth of the work. B is worth it if you intend to keep writing here for years and want the build to
catch your mistakes for you.

## Revision — 2026-11-14, after the publishing requirement

You added: *"I will provide the content and tell AI: hey publish this content."* That moves the recommendation, and not
subtly.

A repository that accepts drafts from a model needs a **contract it can fail against**: a closed vocabulary, a draft
format with no ambiguity, and a command that refuses bad input with an actionable error. The full design is in
[publishing-pipeline.md](publishing-pipeline.md).

Two consequences for the stack:

1. **The schema becomes the most important file in the project** — more than any template. In Astro it is
   `content.config.ts` and the build cannot ignore it. In Eleventy it is a file I write and must remember to call from
   both the build and the publisher. Same rules, different strength of guarantee.
2. **The order changes.** The contract does not depend on the framework, so it can — and should — be built now, on the
   current Eleventy site, where it fixes a live problem (11 posts with no tags, verse stored three different ways).
   Because the schema file is portable, that work is not thrown away when the Astro move happens.

**Revised sequence:** contract + publisher (now, on Eleventy) → design implementation → Astro move → automated share
cards. Astro is still the destination if AI-assisted publishing is permanent; it is just no longer the *first* step.

## Decisions I need from you (later, not now)

- Keep URLs identical? (I would — all 32 are indexed.)
- Is a dark/light **toggle** wanted, or OS-preference only? Today it's OS-only and silent.
- Are the AI-generated images staying as the house style, or is this a moment to commission/curate a consistent set?
  Right now 49 images span at least six distinct visual idioms, and several are near-duplicates.
