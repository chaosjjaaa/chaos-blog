(function () {
  const pages = window.BLOG_PAGES || [];

  const typeClassMap = {
    "首页": "type-home",
    "归档": "type-archive",
    "页面": "type-page",
    "文章": "type-post"
  };

  function normalizePath(url) {
    const link = document.createElement("a");
    link.href = url;
    let path = link.pathname.replace(/\/+/g, "/").replace(/^\//, "");
    if (!path || path.endsWith("/")) path += "index.html";
    return path;
  }

  function currentPath() {
    return normalizePath(window.location.href);
  }

  function pagePath(page) {
    return normalizePath(page.url || "index.html");
  }

  function isCurrentPage(page) {
    const path = currentPath();
    const target = pagePath(page);
    return path === target || path.endsWith("/" + target);
  }

  function isPostPage() {
    const current = pages.find(isCurrentPage);
    return Boolean(current && pagePath(current).startsWith("posts/"));
  }

  function toRelativeUrl(url) {
    const target = pagePath({ url });
    return isPostPage() && !target.startsWith("../") ? "../" + target : target;
  }

  function typeClass(page) {
    return typeClassMap[page.type] || "type-page";
  }

  function makeText(page) {
    return [
      page.title,
      page.type,
      page.excerpt,
      page.content,
      (page.aliases || []).join(" "),
      (page.keywords || []).join(" ")
    ].join(" ").toLowerCase();
  }

  function findPageByName(name) {
    const target = name.trim().toLowerCase();
    return pages.find((page) => {
      const names = [page.title].concat(page.aliases || []);
      return names.some((item) => String(item).trim().toLowerCase() === target);
    });
  }

  function addSearchBehaviour() {
    const searchInput = document.querySelector("[data-search-input]");
    const searchResults = document.querySelector("[data-search-results]");
    if (!searchInput || !searchResults) return;

    const emptyState = searchResults.innerHTML;

    function render(query) {
      const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        searchResults.innerHTML = emptyState;
        return;
      }

      const results = pages
        .map((page) => {
          const haystack = makeText(page);
          const score = words.reduce((total, word) => {
            if (String(page.title).toLowerCase().includes(word)) return total + 5;
            if ((page.aliases || []).join(" ").toLowerCase().includes(word)) return total + 4;
            if (haystack.includes(word)) return total + 1;
            return total;
          }, 0);
          return { page, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || String(a.page.title).localeCompare(String(b.page.title), "zh-CN"));

      if (!results.length) {
        searchResults.innerHTML = '<p class="muted">没有找到匹配内容。可以换一个关键词试试。</p>';
        return;
      }

      searchResults.innerHTML = results.map(({ page }) => `
        <article class="search-result ${typeClass(page)}">
          <p class="tag ${typeClass(page)}">${page.type}</p>
          <h2><a href="${toRelativeUrl(page.url)}">${page.title}</a></h2>
          <p>${page.excerpt}</p>
        </article>
      `).join("");
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    if (initialQuery) {
      searchInput.value = initialQuery;
      render(initialQuery);
    }

    searchInput.addEventListener("input", function () {
      render(searchInput.value);
    });
  }

  function addBacklinks() {
    const container = document.querySelector("[data-backlinks]");
    if (!container) return;

    const current = pages.find(isCurrentPage);
    if (!current) return;

    const names = [current.title].concat(current.aliases || []);
    const backlinks = pages.filter((page) => {
      if (pagePath(page) === pagePath(current)) return false;
      const explicitLinks = page.links || [];
      const searchable = makeText(page);
      return explicitLinks.some((link) => names.includes(link)) || names.some((name) => searchable.includes(String(name).toLowerCase()));
    });

    if (!backlinks.length) {
      container.innerHTML = '<p class="muted">暂时没有页面链接到这里。</p>';
      return;
    }

    container.innerHTML = backlinks.map((page) => `
      <a class="backlink-card ${typeClass(page)}" href="${toRelativeUrl(page.url)}">
        <span>${page.type}</span>
        <strong>${page.title}</strong>
        <small>${page.excerpt}</small>
      </a>
    `).join("");
  }

  function enhanceDataWikiLinks() {
    document.querySelectorAll("[data-wikilink]").forEach((link) => {
      const target = link.getAttribute("data-wikilink") || link.textContent.trim();
      const page = findPageByName(target);
      if (!page) return;
      link.setAttribute("href", toRelativeUrl(page.url));
      link.classList.add("wiki-link", typeClass(page));
    });
  }

  function enhanceMarkdownWikiLinks() {
    const article = document.querySelector(".article");
    if (!article) return;

    const skipTags = new Set(["A", "CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.includes("[[")) return NodeFilter.FILTER_REJECT;
        if (node.parentElement && skipTags.has(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\[\[[^\]]+\]\])/g);
      if (parts.length === 1) return;

      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        const match = part.match(/^\[\[(.+)\]\]$/);
        if (!match) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const label = match[1].trim();
        const page = findPageByName(label);
        if (!page) {
          fragment.appendChild(document.createTextNode(label));
          return;
        }

        const link = document.createElement("a");
        link.href = toRelativeUrl(page.url);
        link.textContent = label;
        link.classList.add("wiki-link", typeClass(page));
        fragment.appendChild(link);
      });

      node.parentNode.replaceChild(fragment, node);
    });
  }

  addSearchBehaviour();
  addBacklinks();
  enhanceDataWikiLinks();
  enhanceMarkdownWikiLinks();
})();
