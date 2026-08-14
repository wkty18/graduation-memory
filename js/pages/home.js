/* ============================================
   首页 · 仪式感 Hero + 班级合照 + 文案 + 时间轴 + 统计
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.home = {
  sevenClicks: 0,

  render() {
    const stats = this.stats();
    return `
    <div class="page home">
      ${this.hero()}
      ${this.classPhoto()}
      ${this.copy()}
      ${this.miniTimeline()}
      ${this.statsHtml(stats)}
      ${this.entries()}
    </div>`;
  },

  mount() {
    this.bindHeroEasterEgg();
    this.bindClassPhoto();
    GM.statCounter.init(GM.$('#app'));
  },

  hero() {
    return `
    <section class="hero">
      <div class="hero__glow"></div>
      <div class="grain"></div>
      <div class="hero__inner container">
        <div class="hero__eyebrow hero-anim" style="animation-delay:.05s">二〇二三 — 二〇二六</div>
        <h1 class="hero__title">
          <span class="hero__line hero-anim" style="animation-delay:.14s">2023级<span class="hero__seven" id="hero-seven">7</span>班</span>
          <span class="hero__line hero__line--sub hero-anim" style="animation-delay:.28s">毕业纪念馆</span>
        </h1>
        <p class="hero__subtitle hero-anim" style="animation-delay:.5s">
          我们曾一起走过青春，如今要去往不同的地方。
        </p>
        <div class="hero__scroll hero-anim" style="animation-delay:.78s">
          <span>向下翻阅</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
    </section>`;
  },

  classPhoto() {
    return `
    <section class="photo-sec container">
      <div class="photo-sec__head reveal">
        <div class="photo-sec__label">一张很重要的照片</div>
        <h2 class="photo-sec__title">我们的合影</h2>
      </div>
      <figure class="class-photo reveal" data-delay="1" id="class-photo">
        <div class="class-photo__frame">
          <img src="assets/archive/graduation-2026/photo-01.jpg"
               alt="毕业演讲 · 我们的三年" loading="lazy" id="class-photo-img">
          <figcaption class="class-photo__info">
            <span class="class-photo__info-title">毕业演讲 · 我们的三年</span>
            <span class="class-photo__info-meta">2026.06 · 毕业典礼</span>
            <span class="class-photo__info-hint">点击进入相册 →</span>
          </figcaption>
        </div>
      </figure>
    </section>`;
  },

  copy() {
    return `
    <section class="copy-sec container container--narrow">
      <p class="copy-line reveal">我们曾在同一间教室里坐下，</p>
      <p class="copy-line reveal" data-delay="1">看过同一块黑板，</p>
      <p class="copy-line reveal" data-delay="1">抱怨过同样的作业，</p>
      <p class="copy-line reveal" data-delay="1">为同一场考试紧张。</p>
      <p class="copy-gap reveal" data-delay="2">后来，</p>
      <p class="copy-line reveal" data-delay="2">我们从这里毕业，</p>
      <p class="copy-line reveal" data-delay="2">去往不同的城市。</p>
      <p class="copy-gap reveal" data-delay="3">有人向北，有人向南，</p>
      <p class="copy-line reveal" data-delay="3">有人去了海边，有人留在故乡。</p>
      <p class="copy-gap reveal" data-delay="4">但我们都来自同一个地方。</p>
      <p class="copy-emph reveal" data-delay="4">2023级7班。</p>
    </section>`;
  },

  miniTimeline() {
    const nodes = [
      { y: '高一', d: '2023.09', t: '第一次见面' },
      { y: '高二', d: '2024.09', t: '我们的青春' },
      { y: '高三', d: '2025.09', t: '最后一段高中时光' },
      { y: '毕业', d: '2026.06', t: '各奔东西' }
    ];
    return `
    <section class="mini-tl container">
      <div class="mini-tl__head reveal">
        <div class="photo-sec__label">从相遇到毕业</div>
        <h2 class="photo-sec__title">三年，不过是一眨眼</h2>
      </div>
      <div class="mini-tl__track reveal" data-delay="1">
        ${nodes.map((n, i) => `
          <div class="mini-tl__node">
            <div class="mini-tl__dot"><span></span></div>
            <div class="mini-tl__year">${n.y}</div>
            <div class="mini-tl__date">${n.d}</div>
            <div class="mini-tl__text">${n.t}</div>
          </div>`).join('')}
      </div>
      <div class="mini-tl__more reveal" data-delay="2">
        <a class="btn" href="#/timeline">看完整的时间线 →</a>
      </div>
    </section>`;
  },

  stats() {
    const cs = GM_DATA.classmates || [];
    const albums = GM_DATA.albums || [];
    const cities = new Set(cs.map((c) => c.city)).size;
    const unis = new Set(cs.map((c) => c.university)).size;
    const media = albums.filter((a) => a.type === 'image' || a.type === 'video').length;
    return [
      { n: cs.length, s: '', label: '位同学' },
      { n: cities, s: '', label: '个城市' },
      { n: unis, s: '', label: '所大学' },
      { n: media, s: '', label: '段回忆' }
    ];
  },

  statsHtml(stats) {
    return `
    <section class="stats-sec">
      <div class="container stats-grid">
        ${stats.map((st, i) => `
          <div class="stat reveal" data-delay="${i}">
            <div class="stat__num"><span data-count="${st.n}" data-suffix="${st.s}">0</span></div>
            <div class="stat__label">${st.label}</div>
          </div>`).join('')}
      </div>
    </section>`;
  },

  entries() {
    const items = [
      { href: '#/map', title: '我们要去哪里', desc: '看看大家散落在了哪些城市。' },
      { href: '#/album', title: '我们的青春', desc: '翻开那些回不去的日子。' },
      { href: '#/letters', title: '写给你', desc: '有些话，只想对一个人说。' }
    ];
    return `
    <section class="entries container">
      ${items.map((it, i) => `
        <a class="entry-card reveal" data-delay="${i}" href="${it.href}">
          <span class="entry-card__idx">0${i + 1}</span>
          <span class="entry-card__title">${it.title}</span>
          <span class="entry-card__desc">${it.desc}</span>
          <span class="entry-card__arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </a>`).join('')}
    </section>`;
  },

  /* 彩蛋：连点“7”七次 */
  bindHeroEasterEgg() {
    const seven = GM.$('#hero-seven');
    if (!seven) return;
    this.sevenClicks = 0;
    seven.addEventListener('click', () => {
      this.sevenClicks++;
      if (this.sevenClicks >= 7) {
        seven.classList.remove('seven-flash');
        void seven.offsetWidth;
        seven.classList.add('seven-flash');
        GM.toast('你还记得我们是七班。', 3000);
        this.sevenClicks = 0;
      }
    });
  },

  /* 班级合照：视差 + 点击进相册 */
  bindClassPhoto() {
    const fig = GM.$('#class-photo');
    if (!fig) return;
    const img = GM.$('#class-photo-img');
    let raf = null;
    fig.addEventListener('mousemove', (e) => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const r = fig.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        img.style.transform = `scale(1.06) translate(${-dx * 14}px, ${-dy * 10}px)`;
      });
    });
    fig.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
    fig.addEventListener('click', () => GM.router.navigate('/album'));
  }
};

GM.router.register('/', () => GM.pages.home.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/') GM.pages.home.mount();
});
