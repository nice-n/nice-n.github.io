module.exports = function (markdown) {
  // Read the source before inline parsing: Markdown trims leading spaces from paragraphs.
  markdown.core.ruler.before("inline", "paragraph_indent", state => {
    const lines = state.src.split("\n");
    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index];
      if (token.type !== "paragraph_open" || token.level !== 0 || !token.map) continue;
      const inline = state.tokens[index + 1];
      const prefix = lines[token.map[0]].match(/^[\u200b \t]+/)?.[0] || "";
      const whitespace = prefix.replaceAll("\u200b", "");
      if (!whitespace || !inline?.content.replace(/[\u200b\s]/g, "")) continue;
      const columns = [...whitespace].reduce((width, char) => char === "\t" ? width + 4 - width % 4 : width + 1, 0);
      token.attrSet("class", "source-indent");
      token.attrSet("style", `--source-indent:${columns}ch`);
      inline.content = inline.content.replace(/^[\u200b \t]+/, "");
    }
  });
};
