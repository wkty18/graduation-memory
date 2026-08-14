/* ============================================
   入口：主题 → 导航 → 路由 → 页脚 → 回到顶部 → Intro
   ============================================ */
GM.app = {
  async boot() {
    GM.theme.init();
    GM.navbar.init();
    GM.music.init();
    GM.stars.init();
    GM.sunlight.init();

    /* 云端初始化（未配置时静默回退本地模式） */
    await GM.cloud.init();
    GM.dataStore.init();

    /* 页脚 */
    GM.$('#footer-root').innerHTML = `
      <div class="footer__motto" id="footer-motto">我们曾经是 2023级7班。</div>
      <div class="footer__sub">2023 — 2026 · 七班毕业纪念馆 · 献给每一个去往远方的你</div>`;

    /* 隐蔽入口：页脚标语连点 5 次 → 管理员口令门 */
    let clicks = 0, timer = null;
    GM.$('#footer-motto').addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 2200);
      if (clicks >= 5 && GM.router.current !== '/admin') {
        clicks = 0;
        GM.router.navigate('/admin');
      }
    });

    /* 回到顶部 */
    const bt = GM.$('#back-top');
    window.addEventListener('scroll', GM.debounce(() => {
      bt.classList.toggle('show', window.scrollY > 640);
    }, 80), { passive: true });
    bt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* 顶部滚动进度条 */
    const prog = document.createElement('div');
    prog.id = 'scroll-progress';
    document.body.prepend(prog);
    const updateProg = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', GM.debounce(updateProg, 30), { passive: true });
    GM.bus.on('route:change', () => setTimeout(updateProg, 80));
    updateProg();

    GM.router.init();

    /* 首次进入时开屏遮罩盖住页面 */
    const root = GM.$('#intro-root');
    root.innerHTML = '<div class="intro intro--hold"></div>';
    GM.intro.init();
  }
};

document.addEventListener('DOMContentLoaded', () => GM.app.boot());
