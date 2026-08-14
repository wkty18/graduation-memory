/* ============================================
   留言板「说点什么」
   云端模式（Supabase）：登录后可留言，所有人可见
   本地模式：显示空状态提示
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.messages = {
  render() {
    return `
    <div class="page messages-page">
      <div class="page-head">
        <div class="eyebrow">说点什么</div>
        <h1>毕业之后，也偶尔来说说话吧</h1>
        <p class="subtitle">天南地北的我们，在这里留一句话</p>
      </div>
      <div class="container container--narrow">
        <div id="msg-composer"></div>
        <div id="msg-list"></div>
      </div>
    </div>`;
  },

  async mount() {
    const list = GM.$('#msg-list');
    const composer = GM.$('#msg-composer');
    if (!list) return;

    if (!GM.cloud.ready) {
      composer.innerHTML = '';
      list.innerHTML = GM.emptyState({
        glyph: '言', title: '留言板需要云端支持。',
        desc: '在 js/config.js 配置 Supabase 后，这里会热闹起来（详见 README）。'
      });
      return;
    }

    /* 留言框：登录态显示输入框，未登录显示登录表单 */
    const { data: { user } } = await GM.cloud.client.auth.getUser();
    if (user) {
      composer.innerHTML = `
        <div class="msg-compose">
          <textarea id="msg-input" rows="3" maxlength="300" placeholder="写一句给 7 班的话……"></textarea>
          <div class="msg-compose__bar">
            <span class="msg-compose__who">以 <b>${GM.escapeHtml(user.email)}</b> 的身份留言</span>
            <button class="btn btn--solid" id="msg-send">留下这句话</button>
          </div>
        </div>`;
      GM.$('#msg-send').addEventListener('click', async () => {
        const content = GM.$('#msg-input').value.trim();
        if (!content) { GM.toast('先写点什么吧。'); return; }
        try {
          await GM.cloud.addMessage(user.email.split('@')[0], content);
          GM.$('#msg-input').value = '';
          this.loadList(list);
          GM.toast('已留下。');
        } catch (e) {
          GM.toast('发送失败，请稍后再试。');
        }
      });
    } else {
      composer.innerHTML = `
        <div class="msg-login">
          <p>登录后就能留言（注册即加入 7 班）。</p>
          <div class="cloud-form">
            <input id="msg-email" type="email" placeholder="邮箱" autocomplete="username">
            <input id="msg-password" type="password" placeholder="密码（至少 6 位）" autocomplete="current-password">
            <button class="btn" id="msg-signin">登录</button>
            <button class="btn" id="msg-signup">注册</button>
          </div>
          <p class="admin-sub" id="msg-auth-msg"></p>
        </div>`;
      const doAuth = async (mode) => {
        const email = GM.$('#msg-email').value.trim();
        const password = GM.$('#msg-password').value;
        const msg = GM.$('#msg-auth-msg');
        if (!email || !password) { msg.textContent = '请填写邮箱和密码（至少 6 位）。'; return; }
        msg.textContent = mode === 'signin' ? '正在登录……' : '正在注册……';
        try {
          if (mode === 'signin') await GM.cloud.signIn(email, password);
          else await GM.cloud.signUp(email, password);
          GM.router.resolve(); /* 重新渲染当前页（避免重复挂载） */
        } catch (e) {
          msg.textContent = (mode === 'signin' ? '登录失败' : '注册失败') + '：' + (e.message || '请检查邮箱密码');
        }
      };
      GM.$('#msg-signin').addEventListener('click', () => doAuth('signin'));
      GM.$('#msg-signup').addEventListener('click', () => doAuth('signup'));
    }

    this.loadList(list);
  },

  async loadList(list) {
    try {
      const msgs = await GM.cloud.fetchMessages();
      if (!msgs.length) {
        list.innerHTML = GM.emptyState({ glyph: '言', title: '还没有留言。', desc: '第一句话，等着第一个开口的人。' });
        return;
      }
      list.innerHTML = `
        <div class="msg-list">
          ${msgs.map((m) => `
            <div class="msg-item">
              <div class="msg-item__head">
                <span class="msg-item__author">${GM.escapeHtml(m.author || '匿名')}</span>
                <span class="msg-item__time">${this.fmt(m.created_at)}</span>
              </div>
              <div class="msg-item__content">${GM.escapeHtml(m.content)}</div>
            </div>`).join('')}
        </div>`;
    } catch (e) {
      list.innerHTML = GM.emptyState({ glyph: '言', title: '留言暂时加载不出来。', desc: '稍后再来看看。' });
    }
  },

  fmt(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return GM.pad(d.getMonth() + 1) + '.' + GM.pad(d.getDate()) + ' ' + GM.pad(d.getHours()) + ':' + GM.pad(d.getMinutes());
  }
};

GM.router.register('/messages', () => GM.pages.messages.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/messages') GM.pages.messages.mount();
});
