/* ============================================
   站点背景音乐
   - 云端优先：从 Supabase audio 存储桶流式播放（原文件不压缩）
     文件命名约定：bgm.mp3 / jinian.mp3（上传到 Storage → audio 桶）
   - 本地备用：云端不可用时自动切换 assets/ 下的本地文件
   - 默认关闭，用户主动点击才播放；支持首手势自动播放（见 tryAutoplay）
   ============================================ */
GM.music = {
  audioBase: GM_CONFIG.supabaseUrl
    ? GM_CONFIG.supabaseUrl + '/storage/v1/object/public/audio/'
    : '',
  /* 曲目来自 js/config.js 的 musicTracks（加歌只改配置） */
  tracks: (GM_CONFIG.musicTracks || []).map((t, i) => ({
    id: 't' + i,
    file: t.file,
    title: t.title,
    local: t.local
  })),
  idx: 0,
  playing: false,
  pending: false,
  loading: false,
  audio: null,

  init() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'none';
    this.idx = parseInt(localStorage.getItem('gm-music-track') || '0', 10) || 0;

    this.audio.addEventListener('loadstart', () => { this.loading = true; this.emit(); });
    this.audio.addEventListener('canplay', () => { this.loading = false; this.emit(); });
    this.audio.addEventListener('playing', () => { this.loading = false; this.emit(); });
    this.audio.addEventListener('ended', () => this.setState(false));
    this.audio.addEventListener('error', () => this.onAudioError());

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

  /* 曲目播放地址：云端优先（支持中文文件名），无配置时用本地文件 */
  srcOf(t) {
    return this.audioBase ? this.audioBase + encodeURIComponent(t.file) : t.local;
  },

  tryAutoplay() {
    this._wantPlay = true;
    const t = this.current();
    this.audio.src = this.srcOf(t);
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
        this._wantPlay = true;
        const t = this.current();
        if (!this.audio.src) this.audio.src = this.srcOf(t);
        this.audio.play().then(() => this.setState(true)).catch(() => {});
        this.emit();
      }
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
  },

  /* 云端失败 → 自动回退本地文件 */
  onAudioError() {
    this.loading = false;
    const t = this.current();
    const cloudUrl = this.audioBase ? new URL(this.srcOf(t), location.href).href : null;
    const usingCloud = cloudUrl && this.audio.src === cloudUrl;
    if (usingCloud && t.local) {
      this._fallback = true;
      this.audio.src = t.local;
      this.audio.load();
      if (this._wantPlay) {
        /* 错误回调是异步时机，可能已失去用户激活上下文：
           重新等待下一次点击/按键后播放 */
        this.pending = true;
        this._gestureBound = false;
        this.bindFirstGesture();
        GM.toast('已切换到本地音乐，点一下页面开始播放。');
      } else {
        GM.toast('云端音乐不可用，已切换到本地音乐。');
      }
    } else {
      this.setState(false);
      GM.toast('这首曲子暂时播放不了。');
    }
    this.emit();
  },

  current() { return this.tracks[this.idx] || this.tracks[0]; },

  toggle() {
    this.playing ? this.pause() : this.play();
  },

  play() {
    if (!this.audio) return;
    this._wantPlay = true;
    const t = this.current();
    const want = this.srcOf(t);
    if (this.audio.src !== new URL(want, location.href).href) this.audio.src = want;
    this.loading = true;
    this.emit();
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
    this._wantPlay = false;
    this.audio.pause();
    this.setState(false);
  },

  select(id) {
    const i = this.tracks.findIndex((t) => t.id === id);
    if (i < 0) return;
    this.idx = i;
    localStorage.setItem('gm-music-track', String(i));
    this._fallback = false;
    if (this.playing) this.play();
    this.emit();
  },

  /* 设置页开关：自动播放 */
  setAutoplay(on) {
    this.autoplayEnabled = on;
    localStorage.setItem('gm-music-autoplay', on ? 'on' : 'off');
    if (on && !this.playing) this.tryAutoplay();
  },

  setState(p) {
    this.playing = p;
    this.emit();
  },

  emit() {
    GM.bus.emit('music:change', {
      playing: this.playing,
      track: this.current(),
      pending: this.pending,
      loading: this.loading
    });
  }
};
