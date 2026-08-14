/* ============================================
   轻提示 Toast（彩蛋 / 反馈用）
   ============================================ */
GM.toast = (msg, duration = 2400) => {
  let el = GM.$('#toast-root .toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    GM.$('#toast-root').appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
};
