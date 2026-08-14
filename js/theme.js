/* ============================================
   主题管理：深色 / 浅色（LocalStorage 持久化）
   ============================================ */
GM.theme = {
  KEY: 'gm-theme',

  init() {
    const saved = localStorage.getItem(this.KEY) || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  },

  current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  set(t, animate = true) {
    if (t === this.current()) return;
    if (animate) {
      document.documentElement.classList.add('theme-anim');
      setTimeout(() => document.documentElement.classList.remove('theme-anim'), 450);
    }
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(this.KEY, t);
    GM.bus.emit('theme:change', t);
  },

  toggle() { this.set(this.current() === 'dark' ? 'light' : 'dark'); }
};
