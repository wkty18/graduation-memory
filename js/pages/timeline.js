/* ============================================
   时间线页「我们一起走过的日子」
   纵向时间轴 · 交替布局 · 节点可挂图 / 视频 / 网页
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.timeline = {
  render() {
    const items = GM_DATA.timeline || [];
    return `
    <div class="page timeline-page">
      <div class="page-head">
        <div class="eyebrow">我们一起走过的日子</div>
        <h1>有些日子，已经回不去了</h1>
        <p class="subtitle">从 2023 年的秋天，到 2026 年的夏天</p>
      </div>
      <div class="container container--narrow">
        ${items.length ? `
        <div class="tl">
          ${items.map((it, i) => this.node(it, i)).join('')}
        </div>
        <div class="tl-end reveal">
          <span class="tl-end__line"></span>
          <span class="tl-end__text">未完待续 —— 故事还在各自的城市里继续</span>
        </div>` : GM.emptyState({ glyph: '时', title: '时间线还是空的。', desc: '去 data/timeline.js 写下第一个日子吧。' })}
      </div>
    </div>`;
  },

  node(it, i) {
    const album = it.image ? (GM_DATA.albums || []).find((a) => a.id === it.image) : null;
    const img = album ? `<img class="tl-node__img" src="${GM.escapeHtml(album.thumb || album.src)}" alt="${GM.escapeHtml(it.title)}" loading="lazy">` : '';
    const btns = [];
    if (it.link && it.link.albumId) btns.push(`<button class="tl-link" data-album-id="${it.link.albumId}">${GM.escapeHtml(it.link.label)} →</button>`);
    if (it.linkVideo && it.linkVideo.albumId) btns.push(`<button class="tl-link" data-album-id="${it.linkVideo.albumId}">${GM.escapeHtml(it.linkVideo.label)} →</button>`);
    if (it.link && it.link.href) btns.push(`<a class="tl-link" href="${GM.escapeHtml(it.link.href)}">${GM.escapeHtml(it.link.label)} →</a>`);

    return `
    <div class="tl-node reveal ${i % 2 ? 'tl-node--right' : ''}">
      <div class="tl-node__dot"><span></span></div>
      <div class="tl-node__card">
        <div class="tl-node__date">${GM.escapeHtml(it.date)}</div>
        <h3 class="tl-node__title">${GM.escapeHtml(it.title)}</h3>
        <p class="tl-node__text">${GM.escapeHtml(it.text)}</p>
        ${img}
        ${btns.length ? `<div class="tl-node__links">${btns.join('')}</div>` : ''}
      </div>
    </div>`;
  },

  mount() {
    GM.$$('.tl-link[data-album-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const albums = GM_DATA.albums || [];
        const idx = albums.findIndex((a) => a.id === btn.dataset.albumId);
        if (idx < 0) return;
        GM.lightbox.open(albums.map((a) => ({
          type: a.type, src: a.src, poster: a.poster, title: a.title,
          date: a.date, place: a.place, desc: a.desc, participants: a.participants
        })), idx);
      });
    });
  }
};

GM.router.register('/timeline', () => GM.pages.timeline.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/timeline') GM.pages.timeline.mount();
});
