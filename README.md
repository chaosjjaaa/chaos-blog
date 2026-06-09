# Chaos Blog

一个基于 GitHub Pages 和 Jekyll 的静态博客。文章使用 Markdown 编写，由 Jekyll 构建为 HTML。

站点地址：https://www.chaos.cn.mt

## 项目结构

```text
.
├── _config.yml              # Jekyll 配置
├── index.md                 # 主页
├── search.html              # 搜索页
├── about.html               # 关于页面
├── _layouts/
│   ├── default.html          # 全站基础布局
│   ├── post.html             # 文章详情布局
│   └── section.html          # 分区页布局
├── _includes/
│   ├── post-card.html        # 文章卡片组件
│   └── backlinks.html        # 双链引用组件
├── _data/
│   └── sections.yml          # 分区配置
├── sections/                 # 分区入口页
├── _posts/                   # Markdown 文章
├── style.css                 # 全站样式
├── home.css                  # 主页样式
├── sidebar.css               # 侧边栏样式
├── blog-data.js              # Jekyll 生成的搜索与双链索引
└── blog.js                   # 搜索、双链和 wiki-link 前端增强
```

## 写文章

文章放在 `_posts/<section>/` 目录下，文件名格式：

```text
YYYY-MM-DD-title.md
```

示例：

```text
_posts/math/2026-06-09-second-order-ode.md
```

推荐 front matter：

```yaml
---
layout: post
title: 文章标题
date: 2026-06-09
section: math
categories: 数学笔记
description: 文章摘要
aliases:
  - 别名
keywords:
  - 关键词
links:
  - 关联页面标题
mathjax: true
---
```

## 分区

分区配置在 `_data/sections.yml` 中维护。

分区页面位于 `sections/*.html`，只需要写：

```yaml
---
layout: section
title: 数学笔记
section_key: math
---
```

分区页会通过 `_layouts/section.html` 自动读取 `_data/sections.yml`，并复用 `_includes/post-card.html` 渲染文章卡片。

## 搜索和双链

当前实现：

- Jekyll 在构建期通过 `blog-data.js` 生成 `window.BLOG_PAGES` 索引。
- 浏览器端 `blog.js` 负责搜索、反向链接计算和 `[[页面标题]]` wiki-link 转换。
- 文章页通过 `_includes/backlinks.html` 显示双链引用区域。

## 本地预览

安装 Jekyll 后运行：

```bash
bundle exec jekyll serve
```

然后打开本地地址预览。
