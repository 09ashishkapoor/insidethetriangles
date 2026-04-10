# Inside The Triangles

[![Built with Eleventy](https://img.shields.io/badge/Built%20with-Eleventy-222222?logo=eleventy&logoColor=white)](https://www.11ty.dev/)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Live Site](https://img.shields.io/badge/Live-insidethetriangles.com-8B0000)](https://insidethetriangles.com)

A devotional writing project built with [Eleventy (11ty)](https://www.11ty.dev/) and published at [insidethetriangles.com](https://insidethetriangles.com).

> Thoughts, stories, and poems centered on Ma Adya Mahakali and Bhairava.

---

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

## Writing a Post

Create a new `.md` file in `site-11ty/src/posts/`:

```md
---
title: "Your Post Title"
slug: "your-post-slug"
date: "2026-01-01T00:00:00.000Z"
feature_image: "/images/your-image.jpg"
excerpt: "A short description for previews."
tags:
  - Poems
layout: "post.liquid"
---

Your content here...
```

Images go in `site-11ty/public/images/`.

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