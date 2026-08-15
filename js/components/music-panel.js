/* ============================================
   音乐控制台：点击右上角音符弹出的迷你播放器
   播放/暂停 · 上一首/下一首 · 进度拖动 · 音量 · 曲目列表
   ============================================ */
GM.musicPanel = {
  open: false,
  dragging: false,

  init() {
    const el = document.createElement('div');
    el.id = 'music-panel';
    el.className = 'music-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', '音乐控制台');
    el.innerHTML = `
      <div class="music-panel__head">
        <div class="music-panel__title" id="mp-title">—</div>
        <div class="music-panel__sub" id="mp-sub"></div>
      </div>
      <div class="music-panel__progress">
        <input type="range" id="mp-seek" min="0" max="1000" value="0" aria-label="播放进度">
        <div class="music-panel__times"><span id="mp-cur">0:00</span><span id="mp-dur">0:00</span></div>
      </div>
      <div class="music-panel__controls">
        <button class="mp-btn" id="mp-prev" aria-label="上一首" title="上一首">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14l-10-7z"/></svg>
        </button>
        <button class="mp-btn mp-btn--play" id="mp-play" aria-label="播放 / 暂停">
          <svg class="mp-ic-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="mp-ic-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
        </button>
        <button class="mp-btn" id="mp-next" aria-label="下一首" title="下一首">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l10-7z"/></svg>
        </button>
        <div class="music-panel__volume" title="音量">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          <input type="range" id="mp-vol" min="0" max="100" value="100" aria-label="音量">
        </div>
      </div>
      <div class="music-panel__list" id="mp-list"></div>`;
    document.body.appendChild(el);
    this.el = el;
    this.bind();
    GM.bus.on('music:change', () => this.sync());
    GM.bus.on('music:time', (t) => this.syncTime(t));
    this.sync();
  },

  toggle() {
    this.open = !this.open;
    this.el.classList.toggle('open', this.open);
    if (this.open) {
      this.sync();
      /* 自动播放待命时，打开面板的点击即可触发播放 */
      if (GM.music.pending && !GM.music.playing) GM.music.play();
    }
  },

  close() {
    this.open = false;
    this.el.classList.remove('open');
  },

  bind() {
    GM.$('#mp-play').addEventListener('click', () => GM.music.toggle());
    GM.$('#mp-prev').addEventListener('click', () => GM.music.prev());
    GM.$('#mp-next').addEventListener('click', () => GM.music.next());

    const seek = GM.$('#mp-seek');
    seek.addEventListener('input', () => {
      this.dragging = true;
      const d = GM.music.audio ? GM.music.audio.duration : 0;
      if (d) GM.music.seek((seek.value / 1000) * d);
    });
    seek.addEventListener('change', () => { this.dragging = false; });
    seek.addEventListener('pointerup', () => { this.dragging = false; });

    GM.$('#mp-vol').addEventListener('input', (e) => {
      GM.music.setVolume(e.target.value / 100);
    });

    /* 点击面板外关闭 */
    document.addEventListener('click', (e) => {
      if (!this.open) return;
      if (this.el.contains(e.target)) return;
      if (e.target.closest && e.target.closest('#music-toggle')) return;
      this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.open) this.close();
    });
  },

  fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + GM.pad(s % 60);
  },

  sync() {
    const t = GM.music.current();
    GM.$('#mp-title').textContent = t.title;
    GM.$('#mp-sub').textContent = '第 ' + (GM.music.idx + 1) + ' / ' + GM.music.tracks.length + ' 首 · 列表循环';
    const playing = GM.music.playing;
    GM.$('.mp-ic-play').style.display = playing ? 'none' : '';
    GM.$('.mp-ic-pause').style.display = playing ? '' : 'none';
    GM.$('#mp-vol').value = Math.round((GM.music.audio ? GM.music.audio.volume : 1) * 100);

    /* 曲目列表 */
    GM.$('#mp-list').innerHTML = GM.music.tracks.map((tr, i) => `
      <button class="mp-track ${i === GM.music.idx ? 'active' : ''}" data-idx="${i}">
        <span class="mp-track__eq">${i === GM.music.idx && playing ? '<i></i><i></i><i></i>' : ''}</span>
        <span class="mp-track__title">${GM.escapeHtml(tr.title)}</span>
        ${i === GM.music.idx ? '<span class="mp-track__dot"></span>' : ''}
      </button>`).join('');
    GM.$$('#mp-list .mp-track').forEach((btn) => {
      btn.addEventListener('click', () => {
        GM.music.idx = parseInt(btn.dataset.idx, 10);
        GM.music.select(GM.music.tracks[GM.music.idx].id);
        if (!GM.music.playing) GM.music.play();
        this.sync();
      });
    });
  },

  syncTime(t) {
    if (this.dragging) return;
    const seek = GM.$('#mp-seek');
    if (!seek) return;
    if (t.duration > 0) seek.value = Math.round((t.time / t.duration) * 1000);
    GM.$('#mp-cur').textContent = this.fmt(t.time);
    GM.$('#mp-dur').textContent = this.fmt(t.duration);
  }
};
