# Inside The Triangles

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Live Site](https://img.shields.io/badge/Live-insidethetriangles.com-8B0000)](https://insidethetriangles.com)

A devotional writing project published at [insidethetriangles.com](https://insidethetriangles.com).

> Thoughts, stories, and poems centered on Ma Adya Mahakali and Bhairava.

## New site — Astro 7

The production site is **Astro 7 + Direction 2 (The Yantra)** in [`site/`](./site), live on Cloudflare Pages.
All 32 existing URLs are preserved; the 32-row taxonomy is approved; the build, URL parity, a11y and links are
green. GitHub `main` deploys the Pages production build (`site/`, `npm ci && npm run build:ci`, `dist`, Node 24).
See [`site/README.md`](./site/README.md) for the runbook.

```bash
cd site
npm ci
npm run check
npm run build
npm test
```

`site-11ty/` is the **Cloudflare Pages rollback** until the Workers preview is accepted. Do not delete it or
edit its content during the transition. The sections below document that rollback.

> **Rollback:** the sections below describe the Eleventy site on Cloudflare Pages.

## Features

- **Dark mode by default** - Automatically follows system preference
- **Fast & static** - Pure HTML/CSS, no client-side JavaScript
- **SEO ready** - Open Graph, Twitter cards, JSON-LD, sitemap
- **Responsive** - Works on mobile, tablet, and desktop

## Tech Stack

- **Site generator:** Eleventy 3
- **Templating:** Liquid
- **Content:** Markdown
- **Styling:** Plain CSS with CSS variables
- **Hosting:** Cloudflare Pages

## Repository Layout

```
site-11ty/
├── eleventy.config.js    # 11ty configuration
├── package.json          # npm scripts
├── public/               # images and static assets
├── scripts/              # helper scripts
└── src/
    ├── _data/            # site metadata (site.js)
    ├── _includes/        # layouts (base.liquid, post.liquid, postcard.liquid)
    ├── css/              # styles (style.css)
    ├── posts/            # markdown content
    ├── index.liquid      # homepage
    ├── articles.liquid   # articles listing
    ├── poems.liquid      # poems listing
    ├── about.liquid      # about page
    └── sitemap.liquid    # sitemap
```

## Quick Start

```bash
cd site-11ty
npm install
npm run dev
```

Visit `http://localhost:8080` — changes rebuild automatically.

### Production Build

```bash
npm run build
```

Output goes to `_site/`.

## Validation Baseline

This repo includes a small browser-first validation baseline for the Eleventy site.

```bash
cd site-11ty
npm install
npx playwright install chromium
npm run validate
```

To intentionally refresh visual baselines after an approved design change:

```bash
cd site-11ty
npm run validate:visual:update
```

See [`docs/validation-baseline.md`](./docs/validation-baseline.md) for the standardized pattern, CI behavior, reuse guidance, and snapshot update process.

## Publishing a Post

Posts are published through one command, which validates the draft, resizes the image, draws a share
card, writes the file and builds the site. Nothing is pushed to a remote.

```bash
cd site-11ty
npm install                      # first time only
npm run publish -- content/inbox/my-piece.md --dry   # validate and preview
npm run publish -- content/inbox/my-piece.md         # write it
```

A draft carries only what the writer knows:

```md
---
title: "Be a Child in the lap of Ma Kali"
deity: kali                      # adya | kali | bhairava | mahakala (two allowed: [kali, bhairava])
form: short                      # poem | short | long | stotram | update
date: 2025-06-10
excerpt: "Devotion as the innocence of a child, and what surrender erases."
image: images/child-kali.jpg     # optional, relative to the draft
---

Body in Markdown. Poems are one line per line, a blank line between stanzas.
```

`slug`, `layout`, reading time, the final image path and the share card are computed — never authored.
The full contract, including the verse and stotram conventions and what every error means, is in
[`site-11ty/content/PUBLISHING.md`](./site-11ty/content/PUBLISHING.md). It is written to be followed by
an agent as much as by a person.

Auditing the archive against the same rules:

```bash
cd site-11ty
npm run content:check            # report
npm run content:report           # …and write content/migration-report.md
```

## Deployment (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Root directory | `site-11ty` |
| Build command | `npm run build` |
| Build output | `_site` |
| Node version | `20` |

## License

MIT — see [LICENSE](./LICENSE).

---

Built with 🙏 for Ma Adya Mahakali and Kalabhairava
