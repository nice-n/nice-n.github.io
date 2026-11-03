---
title: 用 Markdown 写下第一篇手记
date: 2026-11-02
category: 学习记录
description: 建站示例文章：用标题、列表、链接和代码块，组织一篇清晰易读的技术笔记。
keywords: [Markdown, 写作, 示例]
---
> 这是一篇建站示例，用来展示博客的排版与写作方式。

Markdown 是一种用纯文本标记排版的写作方式。博客会在构建时，把它转换成网页。

## 文章放在哪里

在 `src/posts/` 新建一个 `.md` 文件，先填写文章信息：

```yaml
---
title: 我的第一篇文章
date: 2026-11-03
category: 学习记录
description: 一句话概括这篇文章。
keywords: [学习, 笔记]
---
```

下面就可以写正文了。文件名使用英文和连字符，例如 `my-first-note.md`，对应文章地址 `/posts/my-first-note/`。

## 常用格式

- 用 `##` 添加二级标题。
- 用 `**重点**` 表示强调。
- 用列表整理多个要点。
- 用代码块保留代码缩进。

| 内容 | 建议 |
| --- | --- |
| 标题 | 直接说明主题 |
| 摘要 | 说明文章讨论的问题 |
| 正文 | 先说明背景，再展开细节 |

更多语法可以查阅 [Markdown 指南](https://www.markdownguide.org/basic-syntax/)。
