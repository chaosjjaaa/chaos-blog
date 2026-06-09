---
---
(function () {
  const pages = [];

  function addPage(page) {
    pages.push({
      title: page.title || "未命名页面",
      url: page.url || "index.html",
      type: page.type || "页面",
      label: page.label || page.type || "页面",
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
    label: "首页",
    aliases: ["Chaos Blog", "首页"],
    keywords: ["GitHub Pages", "Jekyll", "博客", "学习笔记"],
    excerpt: {{ site.description | jsonify }},
    content: {{ site.description | jsonify }},
    links: []
  });

  {% for item in site.pages %}
  {% if item.title and item.url != '/' and item.search_exclude != true %}
  addPage({
    title: {{ item.title | jsonify }},
    url: {{ item.url | relative_url | jsonify }},
    type: "页面",
    label: "页面",
    aliases: {{ item.aliases | jsonify }},
    keywords: {{ item.keywords | jsonify }},
    excerpt: {{ item.description | default: item.excerpt | default: '' | strip_html | normalize_whitespace | jsonify }},
    content: {{ item.content | strip_html | normalize_whitespace | truncate: 1000 | jsonify }},
    links: {{ item.links | jsonify }}
  });
  {% endif %}
  {% endfor %}

  {% for post in site.posts %}
  {% if post.search_exclude != true %}
  {% assign post_label = '文章' %}
  {% for section_item in site.data.sections %}
  {% assign section_key = section_item[0] %}
  {% assign section_data = section_item[1] %}
  {% if post.section == section_key or post.path contains section_data.dir %}
  {% assign post_label = section_data.label %}
  {% endif %}
  {% endfor %}
  addPage({
    title: {{ post.title | jsonify }},
    url: {{ post.url | relative_url | jsonify }},
    type: "文章",
    label: {{ post_label | jsonify }},
    aliases: {{ post.aliases | jsonify }},
    keywords: {{ post.keywords | default: post.categories | jsonify }},
    excerpt: {{ post.description | default: post.excerpt | default: '' | strip_html | normalize_whitespace | jsonify }},
    content: {{ post.content | strip_html | normalize_whitespace | truncate: 2000 | jsonify }},
    links: {{ post.links | jsonify }}
  });
  {% endif %}
  {% endfor %}

  window.BLOG_PAGES = pages;
})();