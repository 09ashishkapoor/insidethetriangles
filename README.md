# Inside The Triangles

Personal devotional blog at [insidethetriangles.com](https://insidethetriangles.com) — thoughts, stories and poems about Ma Adya Mahakali and Bhairava.

Built with [Eleventy (11ty)](https://www.11ty.dev/) and deployed via [Cloudflare Pages](https://pages.cloudflare.com/).

## Project Structure

```
blog_insidethetrianglesmigration/
└── site-11ty/             # Eleventy site
    ├── eleventy.config.js # Eleventy configuration
    ├── package.json
    ├── public/            # Static files copied to root (robots.txt, images)
    └── src/
        ├── _data/         # Global data (site.js — URL, name, description)
        ├── _includes/     # Layouts (base.njk, post.njk, postcard.njk)
        ├── css/           # Styles (style.css)
        ├── posts/         # Markdown post files
        ├── about.md
        ├── articles.njk
        ├── index.njk
        ├── poems.njk
        └── sitemap.njk    # Auto-generated /sitemap.xml
```

## Local Development

```bash
cd site-11ty
npm install
npm start        # dev server at http://localhost:8080 with live reload
npm run build    # production build → _site/
```

## Adding a Post

Create a new `.md` file in `site-11ty/src/posts/` with this frontmatter:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
date: "2026-01-01T00:00:00.000Z"
feature_image: "/images/your-image.jpg"
excerpt: "A short description shown in previews and meta tags."
tags:
  - Poems          # or: long articles / short articles
---

Your content here...
```

Images go in `site-11ty/public/images/`.

## Deployment (Cloudflare Pages)

Connect the GitHub repo in Cloudflare Pages and set these build settings in the dashboard:

| Setting | Value |
|---|---|
| Root directory | `site-11ty` |
| Build command | `npm run build` |
| Build output directory | `_site` |
| Environment variable | `NODE_VERSION = 20` |

## SEO

Every page includes:
- `<title>`, `<meta name="description">`, `<link rel="canonical">`
- Full Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter/X card (`summary_large_image`)
- JSON-LD structured data (`BlogPosting` for posts, `WebSite` for other pages)
- `/sitemap.xml` — all posts and static pages
- `/robots.txt` — pointing to sitemap

Site URL is configured in `site-11ty/src/_data/site.js`.
