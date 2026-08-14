/* ============================================
   全屏 Lightbox：图片 / 视频 / 音频 / 网页
   键盘方向键 / ESC / 触摸滑动
   ============================================ */
GM.lightbox = {
  items: [],
  index: 0,
  el: null,

  open(items, index = 0) {
    this.items = items;
    this.index = index;
    this.ensure();
    this.render();
    this.el.classList.add('open');
    GM.lockScroll();
    GM.bus.emit('lightbox:open');
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('open');
    this.clearMedia();
    GM.unlockScroll();
  },

  ensure() {
    if (this.el) return;
    this.el = document.createElement('div');
    this.el.className = 'lightbox';
    this.el.innerHTML = `
      <div class="lightbox__top">
        <span class="lightbox__count"></span>
        <button class="lightbox__close" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="lightbox__stage">
        <button class="lightbox__nav lightbox__nav--prev" aria-label="上一张">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="lightbox__media-slot"></div>
        <button class="lightbox__nav lightbox__nav--next" aria-label="下一张">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
      <div class="lightbox__caption"></div>`;
    GM.$('#lightbox-root').appendChild(this.el);

    this.el.querySelector('.lightbox__close').addEventListener('click', () => this.close());
    this.el.querySelector('.lightbox__nav--prev').addEventListener('click', () => this.step(-1));
    this.el.querySelector('.lightbox__nav--next').addEventListener('click', () => this.step(1));
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el || e.target.classList.contains('lightbox__stage')) this.close();
    });

    document.addEventListener('keydown', this._key = (e) => {
      if (!this.el.classList.contains('open')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.step(-1);
      if (e.key === 'ArrowRight') this.step(1);
    });

    /* 触摸滑动 */
    let sx = 0, sy = 0;
    this.el.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    this.el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) this.step(dx < 0 ? 1 : -1);
    }, { passive: true });
  },

  step(d) {
    const n = (this.index + d + this.items.length) % this.items.length;
    this.index = n;
    this.render();
  },

  clearMedia() {
    const slot = this.el.querySelector('.lightbox__media-slot');
    slot.innerHTML = '';
    const audio = slot.querySelector('audio');
    if (audio) { audio.pause(); }
    /* iframe / video 随 innerHTML 移除自动释放 */
  },

  render() {
    const item = this.items[this.index];
    const slot = this.el.querySelector('.lightbox__media-slot');
    slot.innerHTML = '';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.className = 'lightbox__media';
      img.src = item.src;
      img.alt = item.title || '';
      img.onerror = () => { img.replaceWith(this.missingMedia()); };
      slot.appendChild(img);
    } else if (item.type === 'video') {
      const v = document.createElement('video');
      v.className = 'lightbox__media';
      v.src = item.src;
      v.controls = true;
      v.preload = 'metadata';
      if (item.poster) v.poster = item.poster;
      v.onerror = () => { v.replaceWith(this.missingMedia()); };
      slot.appendChild(v);
    } else if (item.type === 'audio') {
      const wrap = document.createElement('div');
      wrap.className = 'lightbox__media lightbox__media--audio';
      wrap.innerHTML = `
        <div class="audio-glyph">♪</div>
        <div style="color:rgba(255,255,255,.85);font-size:15px;letter-spacing:.06em">${GM.escapeHtml(item.title)}</div>
        <div style="color:rgba(255,255,255,.45);font-size:12px;margin-top:4px;letter-spacing:.08em">${GM.escapeHtml(item.date || '')}</div>`;
      const a = document.createElement('audio');
      a.src = item.src;
      a.controls = true;
      a.preload = 'none';
      wrap.appendChild(a);
      slot.appendChild(wrap);
    } else if (item.type === 'iframe') {
      const f = document.createElement('iframe');
      f.className = 'lightbox__media lightbox__media--iframe';
      f.src = item.src;
      f.title = item.title || '';
      f.setAttribute('loading', 'lazy');
      slot.appendChild(f);
    }

    this.el.querySelector('.lightbox__count').textContent =
      `${this.index + 1} / ${this.items.length}`;

    const cap = this.el.querySelector('.lightbox__caption');
    const people = (item.participants && item.participants.length)
      ? `<div class="cap-people">参与同学：${GM.escapeHtml(item.participants.join('、'))}</div>` : '';
    cap.innerHTML = `
      ${item.title ? `<div class="cap-title">${GM.escapeHtml(item.title)}</div>` : ''}
      ${item.date || item.place ? `<div class="cap-meta">${GM.escapeHtml([item.date, item.place].filter(Boolean).join(' · '))}</div>` : ''}
      ${item.desc ? `<div class="cap-desc">${GM.escapeHtml(item.desc)}</div>` : ''}
      ${people}`;
  },

  missingMedia() {
    const d = document.createElement('div');
    d.style.cssText = 'color:rgba(255,255,255,.6);font-size:14px;letter-spacing:.1em;padding:40px;text-align:center';
    d.textContent = '这张照片，暂时找不到了。';
    return d;
  }
};
