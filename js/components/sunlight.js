/* ============================================
   浅色模式晨光氛围
   顶部晨金渐变 + 三枚柔光光斑缓慢漂移；
   与深色模式星空（stars.js）对仗：
   白天 = 晨光，夜晚 = 星空。
   深色模式完全隐藏，不参与交互。
   ============================================ */
GM.sunlight = {
  init() {
    const el = document.createElement('div');
    el.id = 'sunlight';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="sunlight__dawn"></div>
      <span class="sunlight__spot sunlight__spot--1"></span>
      <span class="sunlight__spot sunlight__spot--2"></span>
      <span class="sunlight__spot sunlight__spot--3"></span>`;
    document.body.appendChild(el);
  }
};
