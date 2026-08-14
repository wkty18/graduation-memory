/* ============================================
   数字滚动统计：进入视口后 1.2s 缓动增长
   ============================================ */
GM.statCounter = {
  init(root) {
    const els = GM.$$('[data-count]', root);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        this.run(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  },

  run(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
};
