import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt({ html: true }).use(require('../lib/paragraph-indent'));

test('普通段落按原 Tab 和空格缩进，续行留在同一段落内', () => {
  assert.equal(markdown.render('\u200b\t内部'), '<p class="source-indent" style="--source-indent:4ch">内部</p>\n');
  assert.equal(markdown.render('\u200b\t\t两层\n续行'), '<p class="source-indent" style="--source-indent:8ch">两层\n续行</p>\n');
  assert.equal(markdown.render('  语法'), '<p class="source-indent" style="--source-indent:2ch">语法</p>\n');
});

test('不改变无缩进正文、标题、代码块、列表和引用', () => {
  const original = new MarkdownIt({ html: true });
  for (const source of ['普通正文', '  ## 标题', '```js\n\u200b\tconst x = 1;\n```', '    const x = 1;', '- 列表\n\n  说明', '> 引用', '\u200b\t\t']) {
    assert.equal(markdown.render(source), original.render(source));
  }
});
