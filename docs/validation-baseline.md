# Validation baseline

This repo now standardizes a small browser-first validation baseline for the Eleventy site in `site-11ty/`.

## What was standardized

- **One main local command:** `npm run validate`
- **Smoke coverage:** primary navigation, homepage-to-post flow, and a stable post template
- **Accessibility coverage:** `@axe-core/playwright` on the stable `/about/` flow so shared chrome and static content are covered without relying on date-sorted grids
- **Visual regression:** three element-level snapshots for the shared header, homepage hero, and a stable post header
- **Performance budget:** homepage shell budgets for document weight, stylesheet weight, hero image weight, request count, no-script expectation, and local navigation timing
- **Syntax and config checks:** `node --check` over the validation scripts, Playwright config, and test files
- **Link checking:** a small repo-local link script for `npm run validate`, plus `lycheeverse/lychee-action` against `README.md` and key built entry pages in CI
- **CI:** GitHub Actions for pushes to `main` and pull requests

## Why these repo-specific choices were made

- The site is static and content-heavy, so the highest-value browser checks are navigation and template rendering rather than complex interaction state.
- Homepage grids are useful for smoke coverage but intentionally avoided for visual baselines because their ordering changes as new posts are published.
- `/about/` is the most stable accessibility target because it exercises the shared shell and content layout without collection churn.
- Visual baselines were generated on **Windows**, so browser validation in CI also runs on **`windows-latest`** to keep snapshot rendering aligned.
- Link checking runs separately on **Ubuntu** because `lycheeverse/lychee-action` is documented with Ubuntu usage and does not need snapshot alignment.
- The build now clears `_site/` first so validation never passes against stale generated output.

## Local usage

Run the full local validation baseline from the Eleventy app directory:

```bash
cd site-11ty
npm install
npx playwright install chromium
npm run validate
```

Useful focused commands:

```bash
npm run validate:syntax
npm run validate:browser
npm run validate:links
npm run validate:smoke
npm run validate:a11y
npm run validate:visual
npm run validate:perf
```

## Updating visual baselines intentionally

Only update snapshots when the visual change is expected and reviewed.

```bash
cd site-11ty
npx playwright install chromium
npm run validate:visual:update
```

After updating:

1. Review the changed `.png` baselines under `site-11ty/tests/visual.spec.js-snapshots/`
2. Re-run `npm run validate`
3. Include the reason for the baseline update in the PR description

## Reusing this pattern in future repos

When applying this baseline to another static or frontend-heavy repo:

1. Keep the browser matrix small until a repo clearly needs more than Chromium.
2. Pick **1-3 happy-path smoke flows** that reflect how real users move through the site.
3. Scope accessibility checks to a **stable, important page or flow** instead of the noisiest dynamic surface.
4. Keep visual coverage to **2-3 stable areas** only; prefer shared chrome and stable template shells.
5. Measure a real local baseline before setting a performance budget; budget around the repo's actual HTML/CSS shell, not a copied number.
6. If snapshots are platform-sensitive, generate them on the same OS that CI uses.
7. Keep the implementation repo-relative: config, tests, scripts, docs, and workflow should live with the site.
