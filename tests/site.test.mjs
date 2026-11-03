import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve('_site');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const pages = files(output).filter(file => file.endsWith('.html'));

test('首页、分类、搜索、关于、404 和三篇文章均已生成', () => {
  for (const file of ['index.html', 'categories/index.html', 'search/index.html', 'about/index.html', '404.html', 'posts/hello-world/index.html', 'posts/markdown-writing/index.html', 'posts/static-blog/index.html', 'feed.xml', 'sitemap.xml']) {
    assert.ok(existsSync(path.join(output, file)), file);
  }
});
test('所有页面的站内链接、脚本和样式文件都存在', () => {
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      const destination = path.join(output, decodeURIComponent(match[1]));
      assert.ok(existsSync(destination), `${file}: ${match[1]}`);
    }
    assert.match(html, /lang="zh-CN"/);
    assert.match(html, /name="viewport"/);
    assert.ok(!html.includes('{{'), `模板未解析：${file}`);
  }
});
test('文章 Markdown 转换为标题、代码块、表格，首页包含三张文章卡片', () => {
  const article = readFileSync(path.join(output, 'posts/markdown-writing/index.html'), 'utf8');
  assert.match(article, /<h2>/);
  assert.match(article, /<pre><code/);
  assert.match(article, /<table>/);
  const home = readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.equal([...home.matchAll(/class="card"/g)].length, 3);
  assert.ok(home.indexOf('从这里开始') < home.indexOf('用 Markdown'));
});
test('RSS 与站点地图包含三个文章链接', () => {
  const feed = readFileSync(path.join(output, 'feed.xml'), 'utf8');
  assert.equal([...feed.matchAll(/<item>/g)].length, 3);
  assert.match(feed, /https:\/\/nice-n.github.io\/posts\/hello-world\//);
  const sitemap = readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  assert.equal([...sitemap.matchAll(/<url>/g)].length, 7);
});
