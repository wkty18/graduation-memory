/* ============================================
   成员页「我们」杂志式人物墙 + 个人页
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.classmates = {
  list() {
    return GM_DATA.classmates || [];
  },

  find(id) {
    return this.list().find((c) => c.id === id);
  },

  /* ---------- 人物墙 ---------- */
  render() {
    const cs = this.list();
    const cities = new Set(cs.map((c) => c.city)).size;
    /* 编辑名单仅管理员可见；其他人看到注册/留言引导 */
    const editEntry = (GM.cloud.ready && GM.cloud.adminFlag)
      ? `<div class="container classmates-edit-bar">
          <a class="btn classmates-edit-btn" href="#/admin">＋ 添加 / 编辑同学名单</a>
        </div>`
      : (GM.cloud.ready
        ? `<div class="container classmates-edit-bar">
            <p class="classmates-register-hint">登录后可以给同学留言 ——
              <a class="btn classmates-edit-btn" href="#/messages">注册 / 登录 →</a></p>
          </div>`
        : '');
    return `
    <div class="page classmates-page">
      <div class="page-head">
        <div class="eyebrow">我们</div>
        <h1>${cs.length} 个人，散落成 ${cities} 座城</h1>
        <p class="subtitle">鼠标悬停看看大家，点击进入 TA 的页面</p>
      </div>
      ${editEntry}
      <div class="container">
        ${cs.length ? `<div class="people-grid">${cs.map((c, i) => this.card(c, i)).join('')}</div>` : GM.emptyState({
          glyph: '众', title: '名单还是空的。', desc: '登录后点击上方按钮，添加第一位同学。'
        })}
      </div>
    </div>`;
  },

  card(c, i) {
    return `
    <a class="person-card reveal" data-delay="${i % 4}" href="#/classmates/${c.id}">
      <div class="person-card__photo">
        <img src="${GM.avatarOf(c)}" alt="${GM.escapeHtml(c.name)}" loading="lazy">
      </div>
      <div class="person-card__info">
        <div class="person-card__name">${GM.escapeHtml(c.name)}</div>
        <div class="person-card__uni">${GM.escapeHtml(c.university)}</div>
        <div class="person-card__hover">
          <div class="person-card__major">${GM.escapeHtml(c.major)} · ${GM.escapeHtml(c.city)}</div>
          <div class="person-card__quote">「${GM.escapeHtml(c.quote)}」</div>
          <div class="person-card__tags">${(c.tags || []).map((t) => `<span class="tag">${GM.escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </div>
    </a>`;
  },

  /* ---------- 个人页 ---------- */
  renderProfile(id) {
    const c = this.find(id);
    if (!c) return GM.emptyState({ glyph: '寻', title: '没有找到这位同学。', desc: 'TA 或许用了另一个名字。' });

    const albums = (GM_DATA.albums || []).filter((a) =>
      (a.participants || []).includes(c.name) || (a.participants || []).includes('全班同学'));
    const letter = (GM_DATA.letters || []).find((l) => l.to === c.name);

    return `
    <div class="page profile-page">
      <div class="profile-head container container--narrow">
        <a class="gate__back" href="#/classmates">← 回到「我们」</a>
        <div class="profile-main reveal">
          <img class="profile-avatar" src="${GM.avatarOf(c)}" alt="${GM.escapeHtml(c.name)}">
          <div class="profile-text">
            <h1 class="profile-name">${GM.escapeHtml(c.name)}</h1>
            <div class="profile-uni">${GM.escapeHtml(c.university)} · ${GM.escapeHtml(c.major)}</div>
            <div class="profile-city">去往 ${GM.escapeHtml(c.city)}</div>
            <blockquote class="profile-quote">「${GM.escapeHtml(c.quote)}」</blockquote>
            <div class="profile-tags">${(c.tags || []).map((t) => `<span class="tag">${GM.escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </div>
      </div>

      <div class="container container--narrow">
        <hr class="divider divider--short">
        ${this.contactSection(c, letter)}

        <section class="profile-msgs reveal">
          <h2 class="profile-sec-title">TA 的留言</h2>
          <div id="profile-msg-composer"></div>
          <div id="profile-msg-list"></div>
        </section>
        <hr class="divider divider--short">

        <h2 class="profile-sec-title reveal">TA 的高中回忆</h2>
        ${albums.length ? `
          <div class="profile-mems reveal" data-delay="1">
            ${albums.slice(0, 4).map((a) => `
              <button class="profile-mem" data-album-id="${a.id}" aria-label="查看：${GM.escapeHtml(a.title)}">
                <img src="${GM.escapeHtml(a.thumb || a.src)}" alt="${GM.escapeHtml(a.title)}" loading="lazy">
                <span class="profile-mem__title">${GM.escapeHtml(a.title)}</span>
              </button>`).join('')}
          </div>
          <div class="profile-more reveal" data-delay="2">
            <a class="btn" href="#/album">去相册看全部回忆 →</a>
          </div>` : `<p class="profile-nomem reveal">这里暂时没有 TA 的回忆。</p>`}

        ${letter ? `
        <hr class="divider divider--short">
        <h2 class="profile-sec-title reveal">写给他的信</h2>
        <div class="profile-letter reveal" data-delay="1">
          <p>有一封写给 ${GM.escapeHtml(c.name)} 的信，安静地躺在信件页里。</p>
          <a class="btn" href="#/letters/${letter.id}">去打开那封信 →</a>
        </div>` : ''}
      </div>
    </div>`;
  },

  /* 联系方式：有信 → 解锁后可见；无信 → 点击揭示；无信息 → 不显示 */
  contactSection(c, letter) {
    const ct = c.contact || {};
    const has = !!(ct.wechat || ct.qq || ct.email);
    if (!has) return '';

    const rows = `
      <div class="contact-list">
        ${ct.wechat ? `<div class="contact-row"><span class="contact-glyph">微</span><span class="contact-label">微信</span><span class="contact-value">${GM.escapeHtml(ct.wechat)}</span></div>` : ''}
        ${ct.qq ? `<div class="contact-row"><span class="contact-glyph">Q</span><span class="contact-label">QQ</span><span class="contact-value">${GM.escapeHtml(ct.qq)}</span></div>` : ''}
        ${ct.email ? `<div class="contact-row"><span class="contact-glyph">@</span><span class="contact-label">邮箱</span><span class="contact-value">${GM.escapeHtml(ct.email)}</span></div>` : ''}
      </div>`;

    if (letter) {
      const unlocked = sessionStorage.getItem('gm-letter-' + letter.id) === '1';
      if (!unlocked) {
        return `
        <div class="profile-contact reveal">
          <h2 class="profile-sec-title">联系方式</h2>
          <div class="contact-locked">
            <p>TA 的联系方式，藏在写给他的信里。</p>
            <a class="btn" href="#/letters/${letter.id}">去打开那封信 →</a>
          </div>
        </div>
        <hr class="divider divider--short">`;
      }
      return `
      <div class="profile-contact reveal">
        <h2 class="profile-sec-title">联系方式</h2>
        ${rows}
      </div>
      <hr class="divider divider--short">`;
    }

    /* 无信件：点击揭示 */
    return `
    <div class="profile-contact reveal">
      <h2 class="profile-sec-title">联系方式</h2>
      <button class="btn" id="contact-reveal">点击查看联系方式</button>
      <div class="contact-list contact-list--hidden" id="contact-list">${rows}</div>
    </div>
    <hr class="divider divider--short">`;
  },

  mount() {
    /* 个人页留言墙 */
    this.mountProfileMessages();

    /* 个人页回忆缩略 → Lightbox */
    GM.$$('.profile-mem').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.albumId;
        const albums = GM_DATA.albums || [];
        const idx = albums.findIndex((a) => a.id === id);
        if (idx < 0) return;
        GM.lightbox.open(albums.map((a) => ({
          type: a.type, src: a.src, poster: a.poster, title: a.title,
          date: a.date, place: a.place, desc: a.desc, participants: a.participants
        })), idx);
      });
    });

    /* 无信件的联系方式：点击揭示 */
    const reveal = GM.$('#contact-reveal');
    if (reveal) {
      reveal.addEventListener('click', () => {
        GM.$('#contact-list').classList.remove('contact-list--hidden');
        reveal.remove();
      });
    }
  },

  /* ---------- 个人页留言墙 ---------- */
  async mountProfileMessages() {
    const composer = GM.$('#profile-msg-composer');
    const list = GM.$('#profile-msg-list');
    if (!composer || !list) return;

    if (!GM.cloud.ready) {
      composer.innerHTML = '<p class="profile-nomem">留言墙需要云端支持。</p>';
      list.innerHTML = '';
      return;
    }

    const c = this.find(GM.router.current.split('/').pop());
    if (!c) return;

    if (GM.cloud.signedIn) {
      const who = (await GM.cloud.client.auth.getUser()).data.user.email;
      composer.innerHTML = `
        <div class="pmsg-compose">
          <textarea id="pmsg-input" rows="2" maxlength="200" placeholder="给 ${GM.escapeHtml(c.name)} 留一句话……"></textarea>
          <div class="pmsg-compose__bar">
            <span class="pmsg-compose__who">以 <b>${GM.escapeHtml(who)}</b> 的身份留言</span>
            <button class="btn btn--solid" id="pmsg-send">留下这句话</button>
          </div>
        </div>`;
      GM.$('#pmsg-send').addEventListener('click', async () => {
        const content = GM.$('#pmsg-input').value.trim();
        if (!content) { GM.toast('先写点什么吧。'); return; }
        try {
          await GM.cloud.addProfileMessage(c.id, who.split('@')[0], content);
          GM.$('#pmsg-input').value = '';
          this.loadProfileMessages(c.id, list);
          GM.toast('已留在 TA 的留言墙上。');
        } catch (e) {
          GM.toast('发送失败，请稍后再试。');
        }
      });
    } else {
      composer.innerHTML = `
        <div class="pmsg-login">
          <p>登录后可以给 ${GM.escapeHtml(c.name)} 留言。</p>
          <a class="btn" href="#/messages">注册 / 登录 →</a>
        </div>`;
    }

    this.loadProfileMessages(c.id, list);
  },

  async loadProfileMessages(id, list) {
    try {
      const msgs = await GM.cloud.fetchProfileMessages(id);
      list.innerHTML = msgs.length
        ? `<div class="msg-list">
            ${msgs.map((m) => `
              <div class="msg-item">
                <div class="msg-item__head">
                  <span class="msg-item__author">${GM.escapeHtml(m.author || '匿名')}</span>
                  <span class="msg-item__time">${this.fmtMsg(m.created_at)}</span>
                </div>
                <div class="msg-item__content">${GM.escapeHtml(m.content)}</div>
              </div>`).join('')}
          </div>`
        : '<p class="profile-nomem">还没有人给 TA 留言。来当第一个吧。</p>';
    } catch (e) {
      list.innerHTML = '<p class="profile-nomem">留言暂时加载不出来。</p>';
    }
  },

  fmtMsg(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return GM.pad(d.getMonth() + 1) + '.' + GM.pad(d.getDate()) + ' ' + GM.pad(d.getHours()) + ':' + GM.pad(d.getMinutes());
  }
};

GM.router.register('/classmates', () => GM.pages.classmates.render());
GM.router.register('/classmates/:id', (p) => GM.pages.classmates.renderProfile(p.id));
GM.bus.on('route:change', (info) => {
  if (info.params && info.params.id && GM.pages.classmates.find(info.params.id)) {
    GM.pages.classmates.mount();
  }
});
