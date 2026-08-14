/* ============================================
   深色模式星空背景
   固定种子生成 → 每次加载星空一致；
   纯 CSS 呈现（box-shadow 星点 + 少量闪烁星 + 银河 + 流星）；
   浅色模式完全隐藏（opacity 0），不参与交互。
   ============================================ */
GM.stars = {
  init() {
    const el = document.createElement('div');
    el.id = 'stars';
    el.setAttribute('aria-hidden', 'true');

    /* 固定种子 LCG：星空每次加载保持一致 */
    let seed = 20260707;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    /* 远景星（约 110 颗，1px） */
    const far = [];
    for (let i = 0; i < 110; i++) {
      far.push(`${(rand() * 100).toFixed(2)}vw ${(rand() * 100).toFixed(2)}vh 0 0 rgba(255,255,255,${(0.22 + rand() * 0.38).toFixed(2)})`);
    }
    /* 近景星（约 34 颗，2px，带柔光） */
    const near = [];
    for (let i = 0; i < 34; i++) {
      near.push(`${(rand() * 100).toFixed(2)}vw ${(rand() * 100).toFixed(2)}vh 1px 0 rgba(255,255,255,${(0.3 + rand() * 0.45).toFixed(2)})`);
    }
    /* 独立闪烁星（16 颗，各自相位） */
    const tw = [];
    for (let i = 0; i < 16; i++) {
      tw.push(`<span class="stars__tw" style="left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;animation-delay:${(rand() * 6).toFixed(1)}s;animation-duration:${(2.5 + rand() * 3.5).toFixed(1)}s"></span>`);
    }

    el.innerHTML = `
      <div class="stars__milkyway"></div>
      <div class="stars__far" style="box-shadow:${far.join(',')}"></div>
      <div class="stars__near" style="box-shadow:${near.join(',')}"></div>
      ${tw.join('')}
      <div class="stars__shooting"></div>`;
    document.body.appendChild(el);
  }
};
