(function () {
  const pages = window.BLOG_PAGES || [];

  function currentPath() {
    const path = window.location.pathname.replace(/\/+/g, "/").replace(/^\//, "");
    if (!path || path.endsWith("/")) return "index.html";
    return path;
  }

  function isCurrentPage(page) {
    const path = currentPath();
    return path === page.url || path.endsWith("/" + page.url);
  }

  function isPostPage() {
    const current = pages.find(isCurrentPage);
    return Boolean(current && current.url.startsWith("posts/"));
  }

  function toRelativeUrl(url) {
    return isPostPage() && !url.startsWith("../") ? "../" + url : url;
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
            if (page.title.toLowerCase().includes(word)) return total + 5;
            if ((page.aliases || []).join(" ").toLowerCase().includes(word)) return total + 4;
            if (haystack.includes(word)) return total + 1;
            return total;
          }, 0);
          return { page, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title, "zh-CN"));

      if (!results.length) {
        searchResults.innerHTML = '<p class="muted">没有找到匹配内容。可以换一个关键词试试。</p>';
        return;
      }

      searchResults.innerHTML = results.map(({ page }) => `
        <article class="search-result">
          <p class="tag">${page.type}</p>
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
      if (page.url === current.url) return false;
      const explicitLinks = page.links || [];
      const searchable = makeText(page);
      return explicitLinks.some((link) => names.includes(link)) || names.some((name) => searchable.includes(name.toLowerCase()));
    });

    if (!backlinks.length) {
      container.innerHTML = '<p class="muted">暂时没有页面链接到这里。</p>';
      return;
    }

    container.innerHTML = backlinks.map((page) => `
      <a class="backlink-card" href="${toRelativeUrl(page.url)}">
        <span>${page.type}</span>
        <strong>${page.title}</strong>
        <small>${page.excerpt}</small>
      </a>
    `).join("");
  }

  function enhanceWikiLinks() {
    document.querySelectorAll("[data-wikilink]").forEach((link) => {
      const target = link.getAttribute("data-wikilink") || link.textContent.trim();
      const page = pages.find((item) => item.title === target || (item.aliases || []).includes(target));
      if (!page) return;
      link.setAttribute("href", toRelativeUrl(page.url));
      link.classList.add("wiki-link");
    });
  }

  addSearchBehaviour();
  addBacklinks();
  enhanceWikiLinks();
})();
