/* ============================================
   顶栏导航 + 移动端全屏菜单
   ============================================ */
GM.navbar = {
  links: [
    { path: '/', label: '首页' },
    { path: '/map', label: '地图' },
    { path: '/album', label: '相册' },
    { path: '/letters', label: '信件' },
    { path: '/classmates', label: '我们' },
    { path: '/messages', label: '留言' },
    { path: '/timeline', label: '时间' },
    { path: '/about', label: '关于' }
  ],

  init() {
    this.render();
    const menu = GM.$('#mobile-menu-root');
    menu.classList.add('mobile-menu');
    menu.innerHTML = this.links
      .map((l) => `<a href="#${l.path}" data-mlink="${l.path}">${l.label}</a>`)
      .join('');
    this.bind();
  },

  render() {
    const root = GM.$('#nav-root');
    root.innerHTML = `
      <nav class="nav" id="nav">
        <div class="nav__inner">
          <a class="nav__logo" href="#/">
            <span class="seven">7</span><span>2023级7班</span>
          </a>
          <div class="nav__links">
            ${this.links.map((l) => `<a class="nav__link" data-path="${l.path}" href="#${l.path}">${l.label}</a>`).join('')}
          </div>
          <div class="nav__right">
            <button class="icon-btn" id="music-toggle" aria-label="播放音乐" title="播放 / 暂停背景音乐">
              <svg class="ic-music-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span class="ic-music-eq" style="display:none" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            </button>
            <button class="icon-btn" id="theme-toggle" aria-label="切换深浅色" title="切换深浅色">
              <svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
              <svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>
            </button>
            <a class="icon-btn" href="#/settings" aria-label="设置" title="设置">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.05z"/></svg>
            </a>
            <button class="icon-btn nav__burger" id="nav-burger" aria-label="菜单">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </div>
      </nav>`;
  },

  bind() {
    const nav = GM.$('#nav');
    const onScroll = GM.debounce(() => {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    }, 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    GM.$('#theme-toggle').addEventListener('click', () => GM.theme.toggle());
    GM.bus.on('theme:change', () => this.syncThemeIcon());

    /* 音乐按钮 */
    GM.$('#music-toggle').addEventListener('click', () => GM.music.toggle());
    GM.bus.on('music:change', () => this.syncMusicIcon());
    this.syncMusicIcon();

    /* 移动端菜单 */
    const menu = GM.$('#mobile-menu-root');
    const burger = GM.$('#nav-burger');
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.innerHTML = open
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      GM[open ? 'lockScroll' : 'unlockScroll']();
    });
    GM.$$('[data-mlink]', menu).forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
        GM.unlockScroll();
      })
    );

    this.syncThemeIcon();
    this.syncActive();
    GM.bus.on('route:change', () => this.syncActive());
  },

  syncThemeIcon() {
    const dark = GM.theme.current() === 'dark';
    const moon = GM.$('.ic-moon'), sun = GM.$('.ic-sun');
    if (!moon || !sun) return;
    moon.style.display = dark ? 'none' : '';
    sun.style.display = dark ? '' : 'none';
  },

  syncMusicIcon() {
    const on = GM.$('.ic-music-on'), eq = GM.$('.ic-music-eq');
    if (!on || !eq) return;
    const playing = GM.music.playing;
    on.style.display = playing ? 'none' : '';
    eq.style.display = playing ? '' : 'none';
    GM.$('#music-toggle').title = playing ? '暂停背景音乐' : '播放背景音乐';
  },

  syncActive() {
    const cur = GM.router.current || '/';
    GM.$$('.nav__link').forEach((a) =>
      a.classList.toggle('active', a.dataset.path === cur));
    GM.$$('[data-mlink]').forEach((a) =>
      a.classList.toggle('active', a.dataset.mlink === cur));
  }
};
