---
---
(function () {
  const pages = [];

  function addPage(page) {
    pages.push({
      title: page.title || "未命名页面",
      url: page.url || "index.html",
      type: page.type || "页面",
      aliases: page.aliases || [],
      keywords: page.keywords || [],
      excerpt: page.excerpt || "",
      content: page.content || "",
      links: page.links || []
    });
  }

  addPage({
    title: "主页",
    url: {{ '/' | relative_url | jsonify }},
    type: "首页",
    aliases: ["Chaos Blog", "首页"],
    keywords: ["GitHub Pages", "Jekyll", "博客", "学习笔记"],
    excerpt: {{ site.description | jsonify }},
    content: {{ site.description | append: ' ' | append: site.title | jsonify }},
    links: []
  });

  {% assign normal_pages = site.pages | where_exp: "item", "item.title and item.url != '/'" %}
  {% for item in normal_pages %}
  addPage({
    title: {{ item.title | jsonify }},
    url: {{ item.url | relative_url | jsonify }},
    type: "页面",
    aliases: {{ item.aliases | default: empty | jsonify }},
    keywords: {{ item.keywords | default: empty | jsonify }},
    excerpt: {{ item.description | default: item.excerpt | default: '' | strip_html | normalize_whitespace | jsonify }},
    content: {{ item.content | strip_html | normalize_whitespace | truncate: 1000 | jsonify }},
    links: {{ item.links | default: empty | jsonify }}
  });
  {% endfor %}

  {% for post in site.posts %}
  addPage({
    title: {{ post.title | jsonify }},
    url: {{ post.url | relative_url | jsonify }},
    type: "文章",
    aliases: {{ post.aliases | default: empty | jsonify }},
    keywords: {{ post.keywords | default: post.categories | default: empty | jsonify }},
    excerpt: {{ post.description | default: post.excerpt | default: '' | strip_html | normalize_whitespace | jsonify }},
    content: {{ post.content | strip_html | normalize_whitespace | truncate: 2000 | jsonify }},
    links: {{ post.links | default: empty | jsonify }}
  });
  {% endfor %}

  window.BLOG_PAGES = pages;
})();
