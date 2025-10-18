(function () {
  const inputSelector = '#search-input';
  const listSelector = '#posts-list';
  const resultsSelector = '#search-results';
  const highlight = (text, q) => {
    if (!q) return text;
    try {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(new RegExp(escaped, 'gi'), (m) => `<mark>${m}</mark>`);
    } catch (e) { return text; }
  };

  async function loadIndex() {
    const res = await fetch('/search.json', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  }

  function renderResults(items, q) {
    const el = document.querySelector(resultsSelector);
    if (!el) return;
    if (!items.length) {
      el.innerHTML = '<p>未找到匹配结果。</p>';
      return;
    }
    el.innerHTML = items.map(p => `
      <article class="post-item">
        <h2 class="post-item-title"><a href="${p.url}">${highlight(p.title, q)}</a></h2>
        <p class="post-item-meta">
          <time datetime="${p.date}">${p.date.substring(0, 10)}</time>
          ${p.categories && p.categories.length ? ' · 分类：' + p.categories.map(c => `<a href="/category/${encodeURIComponent(c)}/">${c}</a>`).join('、') : ''}
        </p>
        <p class="post-item-excerpt">${highlight(p.excerpt || '', q)}</p>
        <p class="post-item-readmore"><a href="${p.url}">阅读全文</a></p>
      </article>
    `).join('');
  }

  function attachSearch(index) {
    const input = document.querySelector(inputSelector);
    const list = document.querySelector(listSelector);
    const results = document.querySelector(resultsSelector);
    if (!input || !list || !results) return;

    const toggle = (showResults) => {
      results.hidden = !showResults;
      list.hidden = showResults;
    };

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { toggle(false); return; }
      const lc = q.toLowerCase();
      const items = index.filter(p =>
        (p.title && p.title.toLowerCase().includes(lc)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(lc)) ||
        (Array.isArray(p.tags) && p.tags.join(' ').toLowerCase().includes(lc)) ||
        (Array.isArray(p.categories) && p.categories.join(' ').toLowerCase().includes(lc))
      ).slice(0, 50);
      renderResults(items, q);
      toggle(true);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const index = await loadIndex();
      attachSearch(index);
    } catch (e) {
      // ignore
    }
  });
})();
