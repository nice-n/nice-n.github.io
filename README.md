# nice-n · 个人手记

Markdown 写作、Eleventy 静态构建、GitHub Pages 托管。第一版包含首页、分类筛选、标题/摘要/主题/标签搜索、文章、关于、明暗主题、RSS、站点地图、404 页面和移动端布局。

## 本地预览

需要 Node.js 20 或以上版本，推荐 22。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。构建和检查：

```sh
npm run build
npm test
```

## 修改内容

- `src/_data/site.json`：博客名称、作者、简介、域名和 GitHub 链接。
- `src/index.njk`：首页标题和介绍布局。
- `src/about.md`：个人介绍。
- `src/posts/*.md`：文章；当前三篇均为明确标注的示例，并非作者真实经历。
- `src/assets/style.css`：颜色、布局与排版。

复制任一示例文章，修改文件名和顶部的 title、date、category、description、keywords，再写正文。文件名使用英文和连字符；修改已发布文件名会改变文章 URL。日期使用 YYYY-MM-DD。分类自动从文章汇总，无须另外维护。搜索不包含全文，仅匹配文章元信息。不要把私密文件放进 src/assets，它们会原样发布。

## 首次发布（尚未执行）

1. 在自己的 GitHub 账号下创建 **Public** 仓库 `nice-n.github.io`，不要添加初始化文件。
2. 在本目录运行以下命令；这些命令会创建提交并向 GitHub 上传代码，应在确认发布内容后执行：

```sh
git init -b main
git add .
git commit -m "feat: initialize personal blog"
git remote add origin https://github.com/nice-n/nice-n.github.io.git
git push -u origin main
```

3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 在 Actions 页面查看部署；如首次运行因 Pages 尚未启用而失败，启用后打开工作流手动 Run workflow 或重新运行。
5. 成功后访问 https://nice-n.github.io/，再检查文章、搜索、分类和手机页面。

本配置专用于个人主页根路径，不直接用于 `/cBlog/` 等子路径。没有创建远端仓库、提交、推送或实际发布。

外部资源仅为 Google Fonts，可在无法访问时自动回退系统字体；没有接入访问统计。使用外部字体时浏览器会向 Google 字体服务发出请求，如需完全无外部请求可删除 CSS 第一行。
