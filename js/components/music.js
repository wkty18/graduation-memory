/* ============================================
   站点背景音乐
   - 默认关闭，用户主动点击才播放（浏览器自动播放策略）
   - 曲目列表在此维护：想换新曲子时，
     把音乐文件放进 assets/ 下，替换下方 src 即可
   ============================================ */
GM.music = {
  tracks: [
    { id: 'bgm', src: 'assets/archive/graduation-2026/bgm.mp3', title: '毕业演讲 · 背景音乐（占位）' },
    { id: 'jinian', src: 'assets/archive/graduation-2026/jinian.mp3', title: '纪念（占位）' }
  ],
  idx: 0,
  playing: false,
  audio: null,

  init() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'none';
    this.idx = parseInt(localStorage.getItem('gm-music-track') || '0', 10) || 0;
    this.audio.addEventListener('ended', () => this.setState(false));
    this.audio.addEventListener('error', () => {
      this.setState(false);
      GM.toast('这首曲子暂时播放不了。');
    });

    /* Lightbox 打开时暂停背景音乐，避免声音打架 */
    GM.bus.on('lightbox:open', () => this.pause());
    this.emit();
  },

  current() { return this.tracks[this.idx] || this.tracks[0]; },

  toggle() {
    this.playing ? this.pause() : this.play();
  },

  play() {
    if (!this.audio) return;
    const t = this.current();
    if (this.audio.src !== new URL(t.src, location.href).href) this.audio.src = t.src;
    this.audio.play().then(() => this.setState(true)).catch(() => {
      /* 浏览器拦截或文件缺失 */
      this.setState(false);
      GM.toast('点击音乐按钮开始播放。');
    });
  },

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.setState(false);
  },

  select(id) {
    const i = this.tracks.findIndex((t) => t.id === id);
    if (i < 0) return;
    this.idx = i;
    localStorage.setItem('gm-music-track', String(i));
    if (this.playing) this.play();
    this.emit();
  },

  setState(p) {
    this.playing = p;
    this.emit();
  },

  emit() {
    GM.bus.emit('music:change', { playing: this.playing, track: this.current() });
  }
};
