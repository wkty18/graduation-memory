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
  pending: false,
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

    /* 自动播放（浏览器策略内做到最好）：
       1. 直接尝试（若浏览器信任本站，立即播放）
       2. 被拦截 → 等用户第一次点击/按键时播放
       3. 默认开启，可在设置页关闭 */
    this.autoplayEnabled = localStorage.getItem('gm-music-autoplay') !== 'off';
    if (this.autoplayEnabled) this.tryAutoplay();

    this.emit();
  },

  tryAutoplay() {
    const t = this.current();
    this.audio.src = t.src;
    this.audio.play().then(() => {
      this.setState(true);
      this.pending = false;
    }).catch(() => {
      this.pending = true;
      this.bindFirstGesture();
      this.emit();
      /* 等开屏动画结束后再提示 */
      setTimeout(() => {
        if (this.pending && !this.playing) GM.toast('点一下右上角音符，开启背景音乐', 4500);
      }, 3800);
    });
  },

  /* 用户第一次交互时开始播放（浏览器自动播放策略允许） */
  bindFirstGesture() {
    if (this._gestureBound) return;
    this._gestureBound = true;
    const start = () => {
      if (this.pending && !this.playing) {
        this.pending = false;
        const t = this.current();
        if (!this.audio.src) this.audio.src = t.src;
        this.audio.play().then(() => this.setState(true)).catch(() => {});
        this.emit();
      }
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
  },

  current() { return this.tracks[this.idx] || this.tracks[0]; },

  toggle() {
    this.playing ? this.pause() : this.play();
  },

  play() {
    if (!this.audio) return;
    const t = this.current();
    if (this.audio.src !== new URL(t.src, location.href).href) this.audio.src = t.src;
    this.audio.play().then(() => {
      this.pending = false;
      this.setState(true);
    }).catch(() => {
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

  /* 设置页开关：自动播放 */
  setAutoplay(on) {
    this.autoplayEnabled = on;
    localStorage.setItem('gm-music-autoplay', on ? 'on' : 'off');
    if (on && !this.playing) this.tryAutoplay();
  },

  emit() {
    GM.bus.emit('music:change', { playing: this.playing, track: this.current(), pending: this.pending });
  }
};
