module.exports = function (config) {
  config.setNunjucksEnvironmentOptions({ autoescape: true });
  config.addPassthroughCopy("src/assets");
  config.addFilter("dateLabel", value => new Date(value).toISOString().slice(0, 10).replaceAll("-", "."));
  config.addFilter("isoDate", value => new Date(value).toISOString());
  config.addFilter("reading", text => Math.max(1, Math.ceil(text.replace(/<[^>]*>/g, "").length / 450)));
  config.addCollection("articles", api => api.getFilteredByTag("posts").sort((a, b) => b.date - a.date));
  config.addCollection("topics", api => [...new Set(api.getFilteredByTag("posts").map(p => p.data.category))].sort());
  return { dir: { input: "src", output: "_site", includes: "_includes" }, markdownTemplateEngine: "njk", htmlTemplateEngine: "njk" };
};
