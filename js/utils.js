/* ============================================
   工具函数 & 全局命名空间
   ============================================ */
window.GM = window.GM || {};
window.GM_DATA = window.GM_DATA || {};

GM.$ = (sel, root) => (root || document).querySelector(sel);
GM.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

GM.escapeHtml = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

GM.debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* 数字补零 */
GM.pad = (n) => String(n).padStart(2, '0');

/* 滚动入场：观察容器内所有 .reveal */
GM.scrollReveal = (root) => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  GM.$$('.reveal', root).forEach((el) => io.observe(el));
};

/* 锁定/恢复页面滚动（Lightbox / 抽屉 / 移动端菜单使用）
   注意：html 上设置了 overflow-x，body 的 overflow 不再向视口传播，
   因此必须同时锁定 html，否则浮层打开时页面仍可滚动 */
GM.lockScroll = () => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
};
GM.unlockScroll = () => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
};

/* 简易事件总线 */
GM.bus = {
  _map: {},
  on(evt, fn) { (this._map[evt] = this._map[evt] || []).push(fn); },
  emit(evt, payload) { (this._map[evt] || []).forEach((fn) => fn(payload)); }
};

/* SHA-256 十六进制（信件密码 / 管理员口令校验用） */
GM.sha256 = async (text) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

/* 城市坐标库匹配（地点自动识别）：
   精确 > 前缀 > 包含；自动去掉尾部 市/省/区 等后缀 */
GM.geo = {
  match(input) {
    const q = String(input || '').trim();
    if (!q) return null;
    const variants = [q];
    if (q.length > 2 && /[市区县]$/.test(q)) variants.push(q.slice(0, -1));
    const list = GM_DATA.cities || [];
    let best = null;
    for (const v of variants) {
      for (const c of list) if (c[0] === v) return c;
      for (const c of list) if (c[0].startsWith(v)) { if (!best) best = c; }
      for (const c of list) if (c[0].includes(v)) { if (!best) best = c; }
    }
    return best;
  }
};

/* Base64（UTF-8）编解码（信件正文存储用） */
GM.b64Encode = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};
GM.b64Decode = (b64) => {
  try {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) { return ''; }
};

/* 姓氏首字头像（内联 SVG data URI，无需图片文件） */
GM.avatar = (name, color) => {
  const ch = String(name || '?').charAt(0);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><defs><linearGradient id='a' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${color}'/><stop offset='1' stop-color='${color}' stop-opacity='.72'/></linearGradient></defs><rect width='120' height='120' rx='60' fill='url(#a)'/><text x='60' y='83' font-family='Songti SC,STSong,SimSun,serif' font-size='54' fill='rgba(255,255,255,.93)' text-anchor='middle'>${ch}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
