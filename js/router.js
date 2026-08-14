/* ============================================
   Hash 路由：SPA 页面切换（GitHub Pages 刷新不 404）
   路由表：{ path, render(params) }，支持 #/letters/:id
   ============================================ */
GM.router = {
  routes: [],
  current: null,

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    if (!location.hash) location.replace('#/');
    this.resolve();
  },

  register(path, render) {
    this.routes.push({ path, render });
  },

  navigate(path) {
    if ('#' + path === location.hash) this.resolve();
    else location.hash = '#' + path;
  },

  match(hash) {
    const clean = (hash || '#/').replace(/^#/, '') || '/';
    const parts = clean.split('/').filter(Boolean);
    for (const r of this.routes) {
      const rp = r.path.split('/').filter(Boolean);
      if (rp.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < rp.length; i++) {
        if (rp[i].startsWith(':')) params[rp[i].slice(1)] = decodeURIComponent(parts[i]);
        else if (rp[i] !== parts[i]) { ok = false; break; }
      }
      if (ok) return { route: r, params, path: clean };
    }
    return null;
  },

  resolve() {
    const m = this.match(location.hash);
    const app = GM.$('#app');
    if (!app) return;

    if (m) {
      this.current = m.path;
      app.innerHTML = m.route.render(m.params);
    } else {
      this.current = '404';
      app.innerHTML = GM.emptyState({
        glyph: '寻',
        title: '这一页，好像不在了。',
        desc: '它或许去了很远的地方 —— 回到首页看看吧。'
      });
    }

    GM.scrollReveal(app);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    GM.bus.emit('route:change', { path: this.current, params: m && m.params });
  }
};
