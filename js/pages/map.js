/* ============================================
   中国地图页「我们要去哪里」
   省界数据：国家地理信息公共服务平台（data/china.js）
   点阵星图风格 · 缩放 / 拖拽 / 悬停卡片 / 城市详情
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.map = {
  /* 投影：经纬度 → SVG 坐标（等距圆柱 + 纬度余弦校正，
     H = W * 36°/(62°·cos36°) ≈ 718，保证横纵比例接近真实） */
  W: 1000,
  H: 718,

  project(lng, lat) {
    const b = GM_DATA.map.bounds;
    const x = (lng - b.lngMin) / (b.lngMax - b.lngMin) * this.W;
    const y = (b.latMax - lat) / (b.latMax - b.latMin) * this.H;
    return [x, y];
  },

  /* 聚合城市 */
  cities() {
    const cs = GM_DATA.classmates || [];
    const byCity = {};
    cs.forEach((s) => {
      if (!s.city || !s.coords) return;
      (byCity[s.city] = byCity[s.city] || []).push(s);
    });
    return Object.entries(byCity)
      .map(([city, students]) => ({
        city,
        students,
        count: students.length,
        xy: this.project(students[0].coords[0], students[0].coords[1])
      }))
      .sort((a, b) => b.count - a.count);
  },

  render() {
    return `
    <div class="page map-page">
      <div class="page-head">
        <div class="eyebrow">我们要去哪里</div>
        <h1>我们去了不同的城市</h1>
        <p class="subtitle">滚轮缩放 · 拖拽平移 · 点击城市，看看谁在那里</p>
      </div>
      <div class="map-stage container">
        <div class="map-toolbar">
          <button class="map-zoom-btn" data-zoom="in" aria-label="放大">＋</button>
          <button class="map-zoom-btn" data-zoom="out" aria-label="缩小">－</button>
          <button class="map-zoom-btn" data-zoom="reset" aria-label="复位">⟲</button>
        </div>
        <svg id="map-svg" viewBox="0 0 ${this.W} ${this.H}" preserveAspectRatio="xMidYMid meet" aria-label="中国地图 · 同学分布">
        </svg>
        <div class="map-tooltip" id="map-tooltip"></div>
        <div class="map-hint">共 ${this.cities().length} 座城市 · 每一颗亮起的点，都是一位同学</div>
        <div class="map-credit">省界数据：国家地理信息公共服务平台</div>
      </div>
      <div class="container">
        <aside class="map-detail" id="map-drawer" aria-hidden="true"></aside>
      </div>
    </div>`;
  },

  mount() {
    const svg = GM.$('#map-svg');
    if (!svg) return;
    this.buildMap(svg);
    this.bindPanZoom(svg);
    this.bindToolbar();
  },

  /* ---------- 构建地图 ---------- */
  buildMap(svg) {
    const china = GM_DATA.china;
    const vp = this.svgEl('g', { id: 'map-viewport' });

    /* 省界数据缺失时的兜底 */
    if (!china || !china.provinces || !china.provinces.length) {
      const t = this.svgEl('text', { x: 500, y: 360, 'text-anchor': 'middle', class: 'map-missing' });
      t.textContent = '地图数据暂时缺失。';
      vp.appendChild(t);
      svg.appendChild(vp);
      this.vp = vp;
      this.t = { x: 0, y: 0, k: 1 };
      return;
    }

    /* 点阵 pattern（随地图一起缩放平移） */
    const defs = this.svgEl('defs', {});
    defs.innerHTML = `<pattern id="map-dotpat" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle class="map-pat-dot" cx="6" cy="6" r="1.15"></circle>
    </pattern>`;
    svg.appendChild(defs);

    /* 全部省界环 → 单个 d（evenodd 处理洞与相邻环） */
    const d = china.provinces
      .flatMap(([, rings]) => rings)
      .map((ring) =>
        'M' + ring.map((p) => this.project(p[0], p[1]).map((n) => n.toFixed(1)).join(',')).join('L') + 'Z')
      .join('');

    const attrs = { d, 'fill-rule': 'evenodd' };
    vp.appendChild(this.svgEl('path', Object.assign({ class: 'map-land' }, attrs)));
    vp.appendChild(this.svgEl('path', Object.assign({ class: 'map-land-dots' }, attrs)));
    vp.appendChild(this.svgEl('path', Object.assign({ class: 'map-land-lines' }, attrs)));

    /* 城市连接线 */
    const conns = this.svgEl('g', { class: 'map-conns' });
    const cityMap = {};
    this.cities().forEach((c) => { cityMap[c.city] = c; });
    (GM_DATA.map.connections || []).forEach(([a, b]) => {
      const ca = cityMap[a], cb = cityMap[b];
      if (!ca || !cb) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const mx = (ca.xy[0] + cb.xy[0]) / 2;
      const my = (ca.xy[1] + cb.xy[1]) / 2 - 34;
      path.setAttribute('d', `M ${ca.xy[0]} ${ca.xy[1]} Q ${mx} ${my} ${cb.xy[0]} ${cb.xy[1]}`);
      conns.appendChild(path);
    });
    vp.appendChild(conns);

    /* 城市节点 */
    const nodes = this.svgEl('g', { class: 'map-nodes' });
    this.cities().forEach((c) => {
      nodes.appendChild(this.nodeEl(c));
    });
    vp.appendChild(nodes);

    svg.appendChild(vp);
    this.vp = vp;
    this.t = { x: 0, y: 0, k: 1 };
  },

  nodeEl(c) {
    const [x, y] = c.xy;
    const r = Math.min(5 + c.count * 1.6, 11);
    const g = this.svgEl('g', {
      class: 'map-node',
      'data-city': c.city,
      transform: `translate(${x}, ${y})`
    });
    g.innerHTML = `
      <circle class="node-halo" r="${r + 9}"></circle>
      <circle class="node-core" r="${r}"></circle>
      <text class="node-label" y="${r + 22}" text-anchor="middle">${GM.escapeHtml(c.city)}</text>`;
    return g;
  },

  svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  },

  /* ---------- 平移缩放 ---------- */
  bindPanZoom(svg) {
    let dragging = false, moved = false, px = 0, py = 0;
    let downNode = null;

    const clientToSvg = (e) => {
      const r = svg.getBoundingClientRect();
      return [(e.clientX - r.left) * (this.W / r.width), (e.clientY - r.top) * (this.H / r.height)];
    };

    svg.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false;
      downNode = e.target.closest('.map-node');
      px = e.clientX; py = e.clientY;
      svg.setPointerCapture(e.pointerId);
      svg.classList.add('grabbing');
      this.tipEl().classList.remove('show');
    });
    svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (moved) {
        const r = svg.getBoundingClientRect();
        this.t.x += dx * (this.W / r.width);
        this.t.y += dy * (this.H / r.height);
        px = e.clientX; py = e.clientY;
        this.applyT();
      }
    });
    const endDrag = () => {
      dragging = false;
      svg.classList.remove('grabbing');
      if (!moved && downNode) {
        /* 无拖拽的抬起 = 点击节点 → 打开/收起城市详情 */
        const city = downNode.dataset.city;
        const drawer = GM.$('#map-drawer');
        if (drawer.classList.contains('open') && this.currentCity === city) {
          this.closeDrawer();
        } else {
          this.openDrawer(city);
        }
      }
      downNode = null;
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);

    /* 滚轮缩放（朝光标） */
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [mx, my] = clientToSvg(e);
      const k2 = Math.min(5, Math.max(0.8, this.t.k * (e.deltaY < 0 ? 1.18 : 0.85)));
      this.t.x = mx - (mx - this.t.x) * (k2 / this.t.k);
      this.t.y = my - (my - this.t.y) * (k2 / this.t.k);
      this.t.k = k2;
      this.applyT();
    }, { passive: false });

    /* 双击放大 */
    svg.addEventListener('dblclick', (e) => {
      const [mx, my] = clientToSvg(e);
      const k2 = Math.min(5, this.t.k * 1.7);
      this.t.x = mx - (mx - this.t.x) * (k2 / this.t.k);
      this.t.y = my - (my - this.t.y) * (k2 / this.t.k);
      this.t.k = k2;
      this.applyT();
    });

    /* 节点悬停 tooltip */
    svg.addEventListener('mouseover', (e) => this.onNodeHover(e, true));
    svg.addEventListener('mouseout', (e) => this.onNodeHover(e, false));
    svg.addEventListener('mousemove', (e) => this.onNodeMove(e));

    this.applyT();
  },

  applyT() {
    if (!this.vp) return;
    this.vp.setAttribute('transform', `translate(${this.t.x} ${this.t.y}) scale(${this.t.k})`);
  },

  bindToolbar() {
    GM.$$('.map-zoom-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const op = btn.dataset.zoom;
        const svg = GM.$('#map-svg');
        if (op === 'reset') { this.t = { x: 0, y: 0, k: 1 }; }
        else {
          const mx = this.W / 2, my = this.H / 2;
          const k2 = Math.min(5, Math.max(0.8, this.t.k * (op === 'in' ? 1.35 : 0.74)));
          this.t.x = mx - (mx - this.t.x) * (k2 / this.t.k);
          this.t.y = my - (my - this.t.y) * (k2 / this.t.k);
          this.t.k = k2;
        }
        this.applyT();
      });
    });
  },

  /* ---------- Tooltip ---------- */
  tipEl() { return GM.$('#map-tooltip'); },

  onNodeHover(e, on) {
    const node = e.target.closest('.map-node');
    if (!node) { this.tipEl().classList.remove('show'); return; }
    if (on) this.showTip(node.dataset.city, e);
    else this.tipEl().classList.remove('show');
  },

  onNodeMove(e) {
    if (!this.tipEl().classList.contains('show')) return;
    this.tipEl().style.left = (e.clientX + 16) + 'px';
    this.tipEl().style.top = (e.clientY + 14) + 'px';
  },

  showTip(city, e) {
    const c = this.cities().find((x) => x.city === city);
    if (!c) return;
    const tip = this.tipEl();
    const unis = [...new Set(c.students.map((s) => s.university))].join('、');
    tip.innerHTML = `
      <div class="tt-city">${GM.escapeHtml(city)}</div>
      <div class="tt-count">${c.count} 位同学</div>
      <div class="tt-unis">${GM.escapeHtml(unis)}</div>
      <div class="tt-hint">点击查看 →</div>`;
    tip.style.left = (e.clientX + 16) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
    tip.classList.add('show');
  },

  /* ---------- 城市详情（页内展开面板，跟随页面滚动） ---------- */
  currentCity: null,

  openDrawer(city) {
    const c = this.cities().find((x) => x.city === city);
    if (!c) return;
    this.currentCity = city;
    const drawer = GM.$('#map-drawer');
    drawer.innerHTML = `
      <div class="map-detail__card">
        <button class="drawer-close" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="drawer-city">${GM.escapeHtml(city)}</div>
        <div class="drawer-count">这里有 ${c.count} 位 7 班同学。</div>
        <div class="drawer-list">
          ${c.students.map((s, i) => `
            <a class="drawer-person" style="animation-delay:${i * 70}ms" href="#/classmates/${s.id}">
              <img src="${GM.avatar(s.name, s.color)}" alt="${GM.escapeHtml(s.name)}" loading="lazy">
              <span class="dp-info">
                <span class="dp-name">${GM.escapeHtml(s.name)}</span>
                <span class="dp-uni">${GM.escapeHtml(s.university)} · ${GM.escapeHtml(s.major)}</span>
                <span class="dp-quote">「${GM.escapeHtml(s.quote)}」</span>
              </span>
            </a>`).join('')}
        </div>
      </div>`;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');

    /* 高亮节点 */
    GM.$$('.map-node').forEach((n) => n.classList.toggle('active', n.dataset.city === city));

    drawer.querySelector('.drawer-close').addEventListener('click', () => this.closeDrawer());

    /* 展开后把面板滚进视野 */
    requestAnimationFrame(() => {
      drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  },

  closeDrawer() {
    const drawer = GM.$('#map-drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    this.currentCity = null;
    GM.$$('.map-node').forEach((n) => n.classList.remove('active'));
  }
};

GM.router.register('/map', () => GM.pages.map.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/map') GM.pages.map.mount();
});
