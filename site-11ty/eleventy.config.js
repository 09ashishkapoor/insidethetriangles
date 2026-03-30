import { IdAttributePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({ "public": "." });

  // Collections — filter by inputPath so they work regardless of CWD
  const isPost = (item) => item.inputPath && item.inputPath.includes("/src/posts/");
  const hasTag = (item, tag) => Array.isArray(item.data.tags) && item.data.tags.includes(tag);
  const byDateDesc = (a, b) => b.date - a.date;

  eleventyConfig.addCollection("allPosts", (api) =>
    api.getAll().filter(isPost).sort(byDateDesc)
  );
  eleventyConfig.addCollection("poems", (api) =>
    api.getAll().filter((i) => isPost(i) && hasTag(i, "Poems")).sort(byDateDesc)
  );
  eleventyConfig.addCollection("shortArticles", (api) =>
    api.getAll().filter((i) => isPost(i) && hasTag(i, "short articles")).sort(byDateDesc)
  );
  eleventyConfig.addCollection("longArticles", (api) =>
    api.getAll().filter((i) => isPost(i) && hasTag(i, "long articles")).sort(byDateDesc)
  );

  // Limit filter (Nunjucks slice() chunks arrays — not JS Array.slice)
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  // Date filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
    return d.toISOString();
  });

  // Heading anchors — disable duplicate-id error since Ghost HTML may have them
  eleventyConfig.addPlugin(IdAttributePlugin, { checkDuplicates: false });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
