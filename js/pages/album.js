/* ============================================
   相册页「我们的青春」
   分类瀑布流 + Lightbox（图片 / 视频 / 音频 / 网页）
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.album = {
  cat: 'all',
  items: [],

  render() {
    const cats = GM_DATA.albumCategories || [];
    this.items = this.filtered();
    return `
    <div class="page album-page">
      <div class="page-head">
        <div class="eyebrow">我们的青春</div>
        <h1>但我们拥有相同的回忆</h1>
        <p class="subtitle">${GM.escapeHtml(this.catDesc())}</p>
      </div>
      <div class="album-cats container">
        ${cats.map((c) => `
          <button class="album-cat ${c.id === this.cat ? 'active' : ''}" data-cat="${c.id}">${c.label}</button>`).join('')}
      </div>
      <div id="grad-note-slot">${this.cat === 'graduation' ? this.gradNote() : ''}</div>
      <div class="container album-body">
        ${this.items.length ? `<div class="masonry">${this.gridHtml()}</div>` : GM.emptyState({
          glyph: '册',
          title: '这里暂时没有回忆。',
          desc: '或许它还在我们的相册里。'
        })}
      </div>
    </div>`;
  },

  catDesc() {
    const c = (GM_DATA.albumCategories || []).find((x) => x.id === this.cat);
    return c ? c.desc : '';
  },

  filtered() {
    return (GM_DATA.albums || []).filter((a) => this.cat === 'all' || a.category === this.cat);
  },

  gradNote() {
    return `
    <div class="container grad-note">
      <div class="grad-note__inner">
        <div class="grad-note__glyph">◈</div>
        <p>这个分类里保存着毕业演讲的全部素材 —— 照片、视频、音乐，还有典礼当天播放的原版网页。</p>
        <p class="grad-note__sub">2026.06.09 · 毕业典礼 · 原样纪念</p>
      </div>
    </div>`;
  },

  gridHtml() {
    return this.items.map((it, i) => this.cardHtml(it, i)).join('');
  },

  cardHtml(it, i) {
    const badge = it.type === 'video' ? '▶'
      : it.type === 'iframe' ? '网页'
      : it.type === 'audio' ? '♪' : '';
    const media = it.type === 'audio'
      ? `<div class="m-item__audio"><span class="m-item__audio-note">♪</span><span class="m-item__audio-title">${GM.escapeHtml(it.title)}</span></div>`
      : `<img src="${GM.escapeHtml(it.thumb || it.src)}" alt="${GM.escapeHtml(it.title)}" loading="lazy">`;
    return `
    <figure class="m-item reveal" data-index="${i}" tabindex="0" role="button"
            aria-label="查看：${GM.escapeHtml(it.title)}">
      <div class="m-item__media" style="animation-delay:${Math.min(i, 9) * 45}ms">
        ${media}
        ${badge ? `<span class="m-item__badge">${badge}</span>` : ''}
        <figcaption class="m-item__overlay">
          <div class="m-item__title">${GM.escapeHtml(it.title)}</div>
          <div class="m-item__meta">${GM.escapeHtml([it.date, it.place].filter(Boolean).join(' · '))}</div>
          ${it.uploader ? `<div class="m-item__up">${GM.escapeHtml(it.uploader)} 上传</div>` : ''}
        </figcaption>
      </div>
    </figure>`;
  },

  mount() {
    /* 分类筛选 */
    GM.$$('.album-cat').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.cat === this.cat) return;
        this.cat = btn.dataset.cat;
        this.items = this.filtered();
        GM.$$('.album-cat').forEach((b) => b.classList.toggle('active', b.dataset.cat === this.cat));
        const body = GM.$('.album-body');
        body.innerHTML = this.items.length
          ? `<div class="masonry">${this.gridHtml()}</div>`
          : GM.emptyState({ glyph: '册', title: '这里暂时没有回忆。', desc: '或许它还在我们的相册里。' });
        GM.$('#grad-note-slot').innerHTML = this.cat === 'graduation' ? this.gradNote() : '';
        GM.$('.page-head .subtitle').textContent = this.catDesc();
        GM.scrollReveal(body);
        this.bindCards(body);
      });
    });

    /* 卡片 → Lightbox */
    this.bindCards(GM.$('.album-body'));
  },

  bindCards(root) {
    GM.$$('.m-item', root).forEach((el) => {
      const open = () => {
        const i = parseInt(el.dataset.index, 10);
        GM.lightbox.open(this.items.map((it) => ({
          type: it.type,
          src: it.src,
          poster: it.poster,
          title: it.title,
          date: it.date,
          place: it.place,
          desc: it.desc,
          participants: it.participants
        })), i);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }
};

GM.router.register('/album', () => GM.pages.album.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/album') GM.pages.album.mount();
});
