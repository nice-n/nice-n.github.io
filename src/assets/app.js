(() => {
  const root = document.documentElement;
  document.querySelector('.theme')?.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('blog-theme', root.dataset.theme); } catch (_) {}
  });
  const cards = [...document.querySelectorAll('.card')];
  const search = document.querySelector('#search');
  let category = '';
  const update = () => {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      card.hidden = Boolean((category && card.dataset.category !== category) || !card.dataset.search.toLocaleLowerCase().includes(query));
      if (!card.hidden) count++;
    });
    const empty = document.querySelector('#empty-state');
    if (empty) empty.hidden = count > 0;
    const status = document.querySelector('#search-status');
    if (status) status.textContent = query ? `找到 ${count} 篇文章` : `共 ${count} 篇文章`;
  };
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    update();
  }));
  search?.addEventListener('input', update);
  update();
})();
