---
layout: default
title: Chaos的博客
---

<section class="hero">
  <div class="container">
    <p class="eyebrow">Chaos的博客</p>
    <h1>记录学习笔记和项目</h1>
    <p class="hero-text">
      欢迎来到Chaos的博客，这里主要放置数学、编程、学习笔记、项目整理和个人思考。
    </p>
    <form class="quick-search" action="{{ '/search.html' | relative_url }}" method="get">
      <input name="q" type="search" placeholder="搜索文章或关键词" aria-label="搜索文章或关键词" />
      <button type="submit">搜索</button>
    </form>
  </div>
</section>

<section class="container section home-posts">
  <h2>最近文章</h2>

  {% if site.posts.size > 0 %}
    <div class="card-grid">
      {% for post in site.posts limit: 6 %}
        {% include post-card.html post=post %}
      {% endfor %}
    </div>
  {% else %}
    <p class="muted">还没有文章。把 Markdown 文件放进 <code>_posts/math/</code>、<code>_posts/poem/</code> 等分区目录后，文章会自动显示在这里。</p>
  {% endif %}
</section>
