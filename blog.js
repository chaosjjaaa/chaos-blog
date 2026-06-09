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

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function uniqueValues(values) {
    const seen = new Set();
    const result = [];

    values.forEach((value) => {
      const normalized = normalizeText(value);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      result.push(normalized);
    });

    return result;
  }

  function pageNames(page) {
    return uniqueValues([page.title].concat(page.aliases || []));
  }

  function makeText(page) {
    return normalizeText([
      page.title,
      page.type,
      page.excerpt,
      page.content,
      (page.aliases || []).join(" "),
      (page.keywords || []).join(" ")
    ].join(" "));
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isAsciiName(value) {
    return /^[a-z0-9][a-z0-9 _-]*$/i.test(value);
  }

  function isSearchableName(value) {
    const compact = value.replace(/\s+/g, "");
    return compact.length >= 3;
  }

  function textMentionsName(text, name) {
    if (!isSearchableName(name)) return false;

    if (isAsciiName(name)) {
      const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(name)}(?=$|[^a-z0-9])`, "i");
      return pattern.test(text);
    }

    return text.includes(name);
  }

  function findPageByName(name) {
    const target = normalizeText(name);
    if (!target) return null;

    return pages.find((page) => pageNames(page).includes(target));
  }

  function clearElement(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function appendMutedMessage(container, text) {
    clearElement(container);
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = text;
    container.appendChild(message);
  }

  function createSearchResult(page) {
    const article = document.createElement("article");
    article.className = `search-result ${typeClass(page)}`;

    const tag = document.createElement("p");
    tag.className = `tag ${typeClass(page)}`;
    tag.textContent = page.type || "页面";

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = toRelativeUrl(page.url);
    link.textContent = page.title || "未命名页面";
    title.appendChild(link);

    const excerpt = document.createElement("p");
    excerpt.textContent = page.excerpt || "";

    article.append(tag, title, excerpt);
    return article;
  }

  function createBacklinkCard(page) {
    const link = document.createElement("a");
    link.className = `backlink-card ${typeClass(page)}`;
    link.href = toRelativeUrl(page.url);

    const type = document.createElement("span");
    type.textContent = page.type || "页面";

    const title = document.createElement("strong");
    title.textContent = page.title || "未命名页面";

    const excerpt = document.createElement("small");
    excerpt.textContent = page.excerpt || "";

    link.append(type, title, excerpt);
    return link;
  }

  function addSearchBehaviour() {
    const searchInput = document.querySelector("[data-search-input]");
    const searchResults = document.querySelector("[data-search-results]");
    if (!searchInput || !searchResults) return;

    const emptyState = searchResults.cloneNode(true);

    function restoreEmptyState() {
      clearElement(searchResults);
      Array.from(emptyState.childNodes).forEach((node) => {
        searchResults.appendChild(node.cloneNode(true));
      });
    }

    function render(query) {
      const words = normalizeText(query).split(/\s+/).filter(Boolean);
      if (!words.length) {
        restoreEmptyState();
        return;
      }

      const results = pages
        .map((page) => {
          const haystack = makeText(page);
          const score = words.reduce((total, word) => {
            if (normalizeText(page.title).includes(word)) return total + 5;
            if (normalizeText((page.aliases || []).join(" ")).includes(word)) return total + 4;
            if (haystack.includes(word)) return total + 1;
            return total;
          }, 0);
          return { page, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || String(a.page.title).localeCompare(String(b.page.title), "zh-CN"));

      if (!results.length) {
        appendMutedMessage(searchResults, "没有找到匹配内容。可以换一个关键词试试。");
        return;
      }

      clearElement(searchResults);
      results.forEach(({ page }) => searchResults.appendChild(createSearchResult(page)));
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

    const names = pageNames(current);
    const nameSet = new Set(names);
    const backlinks = pages.filter((page) => {
      if (pagePath(page) === pagePath(current)) return false;

      const explicitLinks = uniqueValues(page.links || []);
      if (explicitLinks.some((link) => nameSet.has(link))) return true;

      const searchable = makeText(page);
      return names.some((name) => textMentionsName(searchable, name));
    });

    if (!backlinks.length) {
      appendMutedMessage(container, "暂时没有页面链接到这里。");
      return;
    }

    clearElement(container);
    backlinks.forEach((page) => container.appendChild(createBacklinkCard(page)));
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
          fragment.appendChild(document.createTextNode(part));
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
