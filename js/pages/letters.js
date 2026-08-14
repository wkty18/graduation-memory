/* ============================================
   信件页「写给你」
   列表（信封）→ 密码门（仪式感）→ 信纸（展开）
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.letters = {
  list() {
    return GM_DATA.letters || [];
  },

  find(id) {
    return this.list().find((l) => l.id === id);
  },

  unlocked(id) {
    return sessionStorage.getItem('gm-letter-' + id) === '1';
  },

  /* ---------- 列表 ---------- */
  renderList() {
    const ls = this.list();
    return `
    <div class="page letters-page">
      <div class="page-head">
        <div class="eyebrow">写给你</div>
        <h1>有些话，只想写给你</h1>
        <p class="subtitle">每一封信都有自己的密码 —— 属于你的人，会知道怎么打开</p>
      </div>
      <div class="container">
        ${ls.length ? `<div class="letters-grid">${ls.map((l) => this.envCard(l)).join('')}</div>` : GM.emptyState({
          glyph: '信', title: '还没有信被写下。', desc: '或许在等一个合适的时候。'
        })}
      </div>
    </div>`;
  },

  envCard(l) {
    const open = this.unlocked(l.id);
    return `
    <a class="env-card reveal ${open ? 'is-open' : ''}" href="#/letters/${l.id}" data-id="${GM.escapeHtml(l.id)}">
      <div class="env">
        <div class="env__flap"></div>
        <div class="env__seal">${open ? '启' : '密'}</div>
        ${open ? '<div class="env__opened">已开启</div>' : ''}
      </div>
      <div class="env-card__to">写给 ${GM.escapeHtml(l.to)}</div>
      <div class="env-card__meta">${GM.escapeHtml(l.from)} · ${GM.escapeHtml(l.date)}</div>
    </a>`;
  },

  /* ---------- 密码门 / 信纸 ---------- */
  renderLetter(id) {
    const l = this.find(id);
    if (!l) return GM.emptyState({ glyph: '寻', title: '这封信，好像寄丢了。', desc: '回到信件列表看看吧。' });

    if (this.unlocked(id)) {
      if (l.cloud) {
        /* 云端信件：正文来自服务端校验后的会话缓存 */
        const body = sessionStorage.getItem('gm-letter-body-' + id);
        if (body) return this.letterView(Object.assign({}, l, { body }));
      } else {
        return this.letterView(l);
      }
    }
    return this.gateView(l);
  },

  gateView(l) {
    return `
    <div class="page gate-page">
      <div class="gate container container--narrow">
        <div class="gate__seal">密</div>
        <h1 class="gate__title">这封信，只写给你。</h1>
        <p class="gate__to">写给 <span>${GM.escapeHtml(l.to)}</span></p>
        <form class="gate__form" id="letter-form" autocomplete="off">
          <div class="gate__input-wrap" id="gate-input-wrap">
            <input type="text" id="letter-password" maxlength="16"
                   placeholder="请输入属于你的密码" aria-label="密码" autocapitalize="characters">
          </div>
          <button class="btn btn--solid" type="submit">开启这封信</button>
        </form>
        <p class="gate__error" id="gate-error">这封信似乎还没有找到它的主人。</p>
        <a class="gate__back" href="#/letters">← 返回所有信件</a>
      </div>
    </div>`;
  },

  letterView(l) {
    const body = l.body || GM.b64Decode(l.bodyB64 || '');
    return `
    <div class="page letter-view">
      <div class="container container--narrow">
        <div class="letter-top">
          <a class="gate__back" href="#/letters">← 返回所有信件</a>
        </div>
        <article class="letter-paper" id="letter-paper">
          <div class="letter-salute">致 ${GM.escapeHtml(l.to)}：</div>
          <div class="letter-body">${GM.escapeHtml(body)}</div>
          <div class="letter-sign">
            <div class="letter-sign__from">—— 来自 2023级7班 · ${GM.escapeHtml(l.from)}</div>
            <div class="letter-sign__date">${GM.escapeHtml(l.date)}</div>
          </div>
        </article>
        <p class="letter-hint">这封信已经展开。看完之后，它会一直在这里等你。</p>
      </div>
    </div>`;
  },

  mountLetter(l) {
    if (this.unlocked(l.id)) return; /* 信纸态无交互 */

    const form = GM.$('#letter-form');
    if (!form) return;
    const input = GM.$('#letter-password');
    const wrap = GM.$('#gate-input-wrap');
    const err = GM.$('#gate-error');
    err.style.opacity = '0';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) { this.showError(wrap, err); return; }

      /* 云端信件：服务端校验密码（连续错 5 次锁 10 分钟） */
      if (l.cloud && GM.cloud.ready) {
        const res = await GM.cloud.openLetter(l.id, val);
        if (res.ok && res.letter) {
          sessionStorage.setItem('gm-letter-' + l.id, '1');
          sessionStorage.setItem('gm-letter-body-' + l.id, res.letter.body);
          const app = GM.$('#app');
          app.innerHTML = this.letterView(Object.assign({}, l, { body: res.letter.body }));
          GM.scrollReveal(app);
          window.scrollTo({ top: 0 });
        } else if (res.locked) {
          err.textContent = '这封信暂时被锁住了，过一会儿再试。';
          this.showError(wrap, err);
        } else {
          input.value = '';
          input.focus();
          err.textContent = '这封信似乎还没有找到它的主人。';
          this.showError(wrap, err);
        }
        return;
      }

      /* 本地信件：前端哈希校验 */
      const hash = await GM.sha256(val);
      if (hash === l.passwordHash) {
        sessionStorage.setItem('gm-letter-' + l.id, '1');
        /* 重新渲染为信纸，并触发展开动画 */
        const app = GM.$('#app');
        app.innerHTML = this.letterView(l);
        GM.scrollReveal(app);
        window.scrollTo({ top: 0 });
      } else {
        input.value = '';
        input.focus();
        this.showError(wrap, err);
      }
    });
  },

  showError(wrap, err) {
    err.style.opacity = '1';
    wrap.classList.remove('shake');
    void wrap.offsetWidth; /* 重新触发动画 */
    wrap.classList.add('shake');
  }
};

GM.router.register('/letters', () => GM.pages.letters.renderList());
GM.router.register('/letters/:id', (p) => GM.pages.letters.renderLetter(p.id));
GM.bus.on('route:change', (info) => {
  const l = info.params && GM.pages.letters.find(info.params.id);
  if (l) GM.pages.letters.mountLetter(l);
});
