/* ============================================
   设置页 · 主题 / 开屏动画 / 信件解锁重置
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.settings = {
  render() {
    const theme = GM.theme.current();
    const intro = localStorage.getItem('gm-intro') !== 'off';
    return `
    <div class="page settings-page">
      <div class="page-head">
        <div class="eyebrow">设置</div>
        <h1>网站设置</h1>
        <p class="subtitle">选择你喜欢的样子，这里会记住</p>
      </div>
      <div class="container container--narrow">

        <section class="set-sec reveal">
          <h2>外观</h2>
          <div class="set-themes">
            <button class="set-theme ${theme === 'light' ? 'active' : ''}" data-theme="light">
              <span class="set-theme__swatch set-theme__swatch--light"></span>
              <span class="set-theme__name">浅色 · 纸页</span>
              <span class="set-theme__desc">米白、温暖，像一本纪念册</span>
            </button>
            <button class="set-theme ${theme === 'dark' ? 'active' : ''}" data-theme="dark">
              <span class="set-theme__swatch set-theme__swatch--dark"></span>
              <span class="set-theme__name">深色 · 夜空</span>
              <span class="set-theme__desc">深灰、静谧，像一片星图</span>
            </button>
          </div>
        </section>

        <section class="set-sec reveal" data-delay="1">
          <h2>体验</h2>
          <label class="set-row">
            <span class="set-row__text">
              <span class="set-row__name">开屏动画</span>
              <span class="set-row__desc">每次打开网站时播放「2023 → 7班 → 毕业纪念馆」</span>
            </span>
            <input type="checkbox" id="set-intro" ${intro ? 'checked' : ''}>
            <span class="switch" aria-hidden="true"></span>
          </label>
        </section>

        <section class="set-sec reveal" data-delay="1">
          <h2>背景音乐</h2>
          <p class="set-sec__desc">当前为占位曲目，换新曲子请看 README。</p>
          <div class="set-tracks">
            ${GM.music.tracks.map((t, i) => `
              <button class="set-track ${i === GM.music.idx ? 'active' : ''}" data-track="${t.id}">
                <span class="set-track__dot"></span>
                <span class="set-track__title">${GM.escapeHtml(t.title)}</span>
              </button>`).join('')}
          </div>
          <label class="set-row">
            <span class="set-row__text">
              <span class="set-row__name">自动播放背景音乐</span>
              <span class="set-row__desc">打开网站后自动尝试播放；若浏览器拦截，会在你第一次点击页面后开始</span>
            </span>
            <input type="checkbox" id="set-music-autoplay" ${GM.music.autoplayEnabled !== false ? 'checked' : ''}>
            <span class="switch" aria-hidden="true"></span>
          </label>
        </section>

        <section class="set-sec reveal" data-delay="2">
          <h2>数据</h2>
          <div class="set-row">
            <span class="set-row__text">
              <span class="set-row__name">重置信件解锁状态</span>
              <span class="set-row__desc">让所有已打开的信件重新封上（仅本浏览器）</span>
            </span>
            <button class="btn" id="set-reset-letters">重置</button>
          </div>
        </section>

      </div>
    </div>`;
  },

  mount() {
    /* 主题卡片 */
    GM.$$('.set-theme').forEach((btn) => {
      btn.addEventListener('click', () => {
        GM.theme.set(btn.dataset.theme);
        GM.$$('.set-theme').forEach((b) => b.classList.toggle('active', b.dataset.theme === GM.theme.current()));
      });
    });

    /* 开屏动画开关 */
    GM.$('#set-intro').addEventListener('change', (e) => {
      localStorage.setItem('gm-intro', e.target.checked ? 'on' : 'off');
    });

    /* 重置信件解锁 */
    GM.$('#set-reset-letters').addEventListener('click', () => {
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith('gm-letter-'));
      keys.forEach((k) => sessionStorage.removeItem(k));
      GM.toast(keys.length ? '信件已重新封好。' : '没有已开启的信件。');
    });

    /* 背景音乐选曲 */
    GM.$$('.set-track').forEach((btn) => {
      btn.addEventListener('click', () => {
        GM.music.select(btn.dataset.track);
        GM.$$('.set-track').forEach((b) => b.classList.toggle('active', b.dataset.track === GM.music.tracks[GM.music.idx].id));
      });
    });

    /* 自动播放开关 */
    GM.$('#set-music-autoplay').addEventListener('change', (e) => {
      GM.music.setAutoplay(e.target.checked);
      GM.toast(e.target.checked ? '已开启自动播放。' : '已关闭自动播放。');
    });
  }
};

GM.router.register('/settings', () => GM.pages.settings.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/settings') GM.pages.settings.mount();
});
