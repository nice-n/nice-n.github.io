import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve('_site');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const pages = files(output).filter(file => file.endsWith('.html'));
const posts = readdirSync('src/posts').filter(file => file.endsWith('.md'));

test('首页、分类、搜索、关于、404 和所有文章均已生成', () => {
  for (const post of posts) {
    assert.ok(existsSync(path.join(output, 'posts', path.basename(post, '.md'), 'index.html')), post);
  }
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
test('文章 Markdown 转换为标题、代码块、表格，首页卡片数量与文章一致', () => {
  const article = readFileSync(path.join(output, 'posts/markdown-writing/index.html'), 'utf8');
  assert.match(article, /<h2>/);
  assert.match(article, /<pre><code/);
  assert.match(article, /<table>/);
  const home = readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.equal([...home.matchAll(/class="card"/g)].length, posts.length);
  assert.ok(home.indexOf('JavaScript 学习笔记') < home.indexOf('从这里开始'));
  assert.ok(home.indexOf('从这里开始') < home.indexOf('用 Markdown'));
});
test('RSS 与站点地图包含所有文章链接', () => {
  const feed = readFileSync(path.join(output, 'feed.xml'), 'utf8');
  assert.equal([...feed.matchAll(/<item>/g)].length, posts.length);
  assert.match(feed, /https:\/\/nice-n.github.io\/posts\/hello-world\//);
  const sitemap = readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  assert.equal([...sitemap.matchAll(/<url>/g)].length, posts.length + 4);
});

test('JavaScript 笔记正常显示，缺失图片使用占位说明且未泄露本地路径', () => {
  const html = readFileSync(path.join(output, 'posts/javascript-notes/index.html'), 'utf8');
  assert.match(html, /JavaScript 学习笔记/);
  assert.match(html, /图片待补充/);
  assert.match(html, /防抖/);
  assert.match(html, /节流/);
  assert.doesNotMatch(html, /typora-user-images|C:\\Users\\/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
});
