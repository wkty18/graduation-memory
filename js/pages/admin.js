/* ============================================
   管理员入口「纪念馆控制台」（隐蔽）
   ------------------------------------------------------------
   入口方式（不在任何界面露出链接）：
     1. 在页脚「我们曾经是 2023级7班。」上连点 5 次
     2. 或直接访问 #/admin
   口令校验：SHA-256 哈希比对（前端访问限制，非服务器级安全）
   ------------------------------------------------------------
   同学 / 信件管理说明：静态站无后端，编辑保存在本浏览器
   （localStorage 覆盖层，见 datastore.js），
   导出 classmates.js / letters.js 替换 data/ 下同名文件后
   对所有人永久生效。
   信件密码：管理员输入明文，浏览器即时计算 SHA-256 哈希后
   保存，明文不出现在任何存储里；编辑时密码留空保持原密码。
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.admin = {
  /* 口令的 SHA-256 哈希（明文口令只存在你手里） */
  PASSWORD_HASH: '0b23fafc23f337b477c93263a9f6b1b6639976f5c9b0a39f6d41ca075be6c35a',

  COLORS: ['#7E94A8', '#B08A96', '#8FA68F', '#9B8FA8', '#A99078', '#A8816E',
    '#7E9A96', '#8A97A6', '#A6936F', '#8F7E9E', '#6F8F8A', '#A08B7E'],

  unlocked() {
    return sessionStorage.getItem('gm-admin') === '1';
  },

  /* 能否进入控制台：口令解锁 或 云端已登录 */
  canEnter() {
    return this.unlocked() || (GM.cloud.ready && GM.cloud.signedIn);
  },

  render() {
    if (this.canEnter()) return this.panel();
    return this.gate();
  },

  /* ---------- 口令门 ---------- */
  gate() {
    return `
    <div class="page gate-page">
      <div class="gate container container--narrow">
        <div class="gate__seal admin-seal">管</div>
        <h1 class="gate__title">这里是纪念馆的控制台</h1>
        <p class="gate__to">输入口令，进入管理员模式</p>
        <form class="gate__form" id="admin-form" autocomplete="off">
          <div class="gate__input-wrap" id="admin-input-wrap">
            <input type="password" id="admin-password" maxlength="32"
                   placeholder="口令" aria-label="管理员口令" autocomplete="off">
          </div>
          <button class="btn btn--solid" type="submit">进入</button>
        </form>
        <p class="gate__error" id="admin-error">口令似乎不对。</p>
        <a class="gate__back" href="#/">← 回到首页</a>
      </div>
    </div>`;
  },

  mountGate() {
    const form = GM.$('#admin-form');
    if (!form) return;
    const input = GM.$('#admin-password');
    const wrap = GM.$('#admin-input-wrap');
    const err = GM.$('#admin-error');
    err.style.opacity = '0';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) { this.showError(wrap, err); return; }
      const hash = await GM.sha256(val);
      if (hash === this.PASSWORD_HASH) {
        sessionStorage.setItem('gm-admin', '1');
        const app = GM.$('#app');
        app.innerHTML = this.panel();
        GM.scrollReveal(app);
        this.mountPanel();
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
    void wrap.offsetWidth;
    wrap.classList.add('shake');
  },

  /* ---------- 控制台面板 ---------- */
  panel() {
    return `
    <div class="page admin-page">
      <div class="page-head">
        <div class="eyebrow">管理员模式</div>
        <h1>纪念馆控制台</h1>
        <p class="subtitle">这里是纪念馆的仪表盘，仅你可见</p>
      </div>
      <div class="container container--narrow">

        <section class="set-sec reveal" data-role="admin">
          <h2>数据总览</h2>
          <div id="admin-stats"></div>
        </section>

        <section class="set-sec reveal" data-delay="1" data-role="admin">
          <h2>同学管理</h2>
          <p class="admin-sub">新增、编辑同学，并在地图上直接标记 TA 所在的位置。</p>
          <div id="admin-cm-list"></div>
          <div class="admin-actions" style="margin-top:14px">
            <button class="btn" id="admin-cm-add">＋ 新增同学</button>
            <button class="btn" id="admin-cm-autogeo">自动识别未标记位置</button>
            <button class="btn" id="admin-cm-export">导出 classmates.js</button>
            <button class="btn" id="admin-cm-reset" style="display:none">撤销全部本地修改</button>
          </div>
          <div id="admin-cm-editor"></div>
          <p class="admin-sub">编辑只保存在本浏览器；导出 classmates.js 并替换 data/ 下同名文件后，所有人可见。</p>
        </section>

        <section class="set-sec reveal" data-delay="2" data-role="admin">
          <h2>信件管理</h2>
          <p class="admin-sub">编辑信封内容，并为每封信设置专属密码。</p>
          <div id="admin-lt-list"></div>
          <div class="admin-actions" style="margin-top:14px">
            <button class="btn" id="admin-lt-add">＋ 新增信件</button>
            <button class="btn" id="admin-lt-export">导出 letters.js</button>
            <button class="btn" id="admin-lt-reset" style="display:none">撤销全部本地修改</button>
          </div>
          <div id="admin-lt-editor"></div>
          <p class="admin-sub">密码以 SHA-256 哈希保存（明文不落盘）；编辑时密码留空则保持原密码。</p>
        </section>

        <section class="set-sec reveal" data-delay="3">
          <h2>云端同步</h2>
          <div id="admin-cloud"></div>
        </section>

        <section class="set-sec reveal" data-delay="4" data-role="admin">
          <h2>快捷操作</h2>
          <div class="admin-actions">
            <button class="btn" id="admin-clear-all">清空全部本地设置</button>
            <button class="btn" id="admin-reset-letters">重置信件解锁</button>
            <button class="btn" id="admin-export">导出数据备份（JSON）</button>
            <button class="btn" id="admin-lock">锁定控制台</button>
          </div>
          <p class="admin-sub">「清空全部本地设置」会重置主题、开屏与音乐选择，并回到首页。</p>
        </section>

        <section class="set-sec reveal" data-delay="5" data-role="admin">
          <h2>环境信息</h2>
          <div class="admin-env" id="admin-env"></div>
        </section>

        <section class="set-sec reveal" data-delay="6">
          <h2>提示</h2>
          <p class="admin-sub">内容的增删改请直接编辑 data/ 目录下的数据文件，详见 README。</p>
          <p class="admin-sub">本入口为前端访问限制（口令哈希校验）；云端模式下信件密码由服务端校验。</p>
        </section>

      </div>
    </div>`;
  },

  /* ---------- 数据总览 ---------- */
  statsHtml() {
    const cs = GM_DATA.classmates || [];
    const al = GM_DATA.albums || [];
    const tl = GM_DATA.timeline || [];
    const ls = GM_DATA.letters || [];
    const china = GM_DATA.china;
    const chinaPts = china ? china.provinces.reduce((n, [, rings]) => n + rings.reduce((m, r) => m + r.length, 0), 0) : 0;
    const stats = [
      { n: cs.length, label: '位同学' },
      { n: new Set(cs.map((c) => c.city).size), label: '座城市' },
      { n: al.length, label: '条相册条目' },
      { n: ls.length, label: '封信' },
      { n: tl.length, label: '个时间节点' },
      { n: china ? china.provinces.length : 0, label: '个省级行政区' }
    ];
    const albumTypes = ['image', 'video', 'audio', 'iframe'].map((t) =>
      `${t === 'image' ? '图片' : t === 'video' ? '视频' : t === 'audio' ? '音频' : '网页'} ${al.filter((a) => a.type === t).length}`).join(' · ');
    const dirty = [];
    Object.values(GM.dataStore.SCOPES).forEach((s) => {
      if (GM.dataStore.hasChanges(s)) dirty.push(s.label);
    });
    return `
      <div class="admin-stats">
        ${stats.map((s) => `
          <div class="admin-stat">
            <div class="admin-stat__num">${s.n}</div>
            <div class="admin-stat__label">${s.label}</div>
          </div>`).join('')}
      </div>
      <p class="admin-sub">相册构成：${albumTypes}</p>
      <p class="admin-sub">省界数据：${chinaPts} 个坐标点</p>
      <p class="admin-sub">${GM.cloud.ready
        ? '云端同步：<span style="color:var(--accent)">已连接</span> · 编辑保存到云端，所有人可见'
        : '云端同步：未配置（本地模式）'}${dirty.length ? ' · <span style="color:var(--accent)">本地修改未导出：' + dirty.join('、') + '</span>' : ''}</p>`;
  },

  /* ---------- 同学管理：列表 ---------- */
  listHtml() {
    const cs = GM_DATA.classmates || [];
    if (!cs.length) return GM.emptyState({ glyph: '众', title: '还没有同学。', desc: '点击下方「新增同学」添加第一位。' });
    return `
    <div class="cm-list">
      ${cs.map((c) => `
        <div class="cm-row" data-id="${GM.escapeHtml(c.id)}">
          <img class="cm-row__avatar" src="${GM.avatarOf(c)}" alt="" loading="lazy">
          <div class="cm-row__main">
            <div class="cm-row__name">${GM.escapeHtml(c.name)}
              ${!c.coords ? '<span class="cm-row__warn">未标记位置</span>' : ''}</div>
            <div class="cm-row__sub">${GM.escapeHtml([c.city, c.university].filter(Boolean).join(' · '))}</div>
          </div>
          <div class="cm-row__ops">
            <button class="cm-op" data-op="edit" title="编辑">编辑</button>
            <button class="cm-op cm-op--danger" data-op="del" title="删除">删除</button>
          </div>
        </div>`).join('')}
    </div>`;
  },

  /* ---------- 信件管理：列表 ---------- */
  lettersListHtml() {
    const ls = GM_DATA.letters || [];
    if (!ls.length) return GM.emptyState({ glyph: '信', title: '还没有信。', desc: '点击下方「新增信件」写下第一封。' });
    return `
    <div class="cm-list">
      ${ls.map((l) => `
        <div class="cm-row" data-id="${GM.escapeHtml(l.id)}">
          <span class="cm-row__glyph">✉</span>
          <div class="cm-row__main">
            <div class="cm-row__name">写给 ${GM.escapeHtml(l.to)}</div>
            <div class="cm-row__sub">${GM.escapeHtml(l.from || '未署名')} · ${GM.escapeHtml(l.date || '未标注日期')}</div>
          </div>
          <div class="cm-row__ops">
            <button class="cm-op" data-op="edit" title="编辑">编辑</button>
            <button class="cm-op cm-op--danger" data-op="del" title="删除">删除</button>
          </div>
        </div>`).join('')}
    </div>`;
  },

  /* ---------- 同学编辑器 ---------- */
  _edit: null,

  editorHtml(c) {
    const colors = this.COLORS;
    const cities = [...new Set((GM_DATA.classmates || []).map((x) => x.city).filter(Boolean))];
    return `
    <div class="cm-editor">
      <h3 class="cm-editor__title">${c ? '编辑 ' + GM.escapeHtml(c.name) : '新增同学'}</h3>
      <div class="cm-grid">
        <label class="cm-field">姓名 *
          <input id="cm-name" value="${c ? GM.escapeHtml(c.name) : ''}" maxlength="12" placeholder="如：张三">
        </label>
        <label class="cm-field">城市
          <input id="cm-city" value="${c ? GM.escapeHtml(c.city || '') : ''}" maxlength="14"
                 placeholder="如：北京（输入后自动识别位置）" list="cm-city-list">
          <datalist id="cm-city-list">${cities.map((x) => `<option value="${GM.escapeHtml(x)}">`).join('')}</datalist>
          <span class="cm-geo-status" id="cm-geo-status"></span>
          <button type="button" class="cm-op" id="cm-geo-online" style="display:none;align-self:flex-start">联网识别</button>
        </label>
        <label class="cm-field">大学
          <input id="cm-uni" value="${c ? GM.escapeHtml(c.university || '') : ''}" maxlength="24" placeholder="如：清华大学">
        </label>
        <label class="cm-field">专业
          <input id="cm-major" value="${c ? GM.escapeHtml(c.major || '') : ''}" maxlength="24" placeholder="如：计算机科学与技术">
        </label>
        <label class="cm-field">一句话
          <input id="cm-quote" value="${c ? GM.escapeHtml(c.quote || '') : ''}" maxlength="40" placeholder="一句话介绍自己">
        </label>
        <label class="cm-field">标签（逗号分隔）
          <input id="cm-tags" value="${c ? GM.escapeHtml((c.tags || []).join('，')) : ''}" maxlength="40" placeholder="如：班长，数竞">
        </label>
        <label class="cm-field">性别
          <select id="cm-gender">
            <option value="男" ${c && c.gender === '男' ? 'selected' : ''}>男</option>
            <option value="女" ${c && c.gender === '女' ? 'selected' : ''}>女</option>
          </select>
        </label>
        <label class="cm-field">微信
          <input id="cm-wechat" value="${c && c.contact ? GM.escapeHtml(c.contact.wechat || '') : ''}" maxlength="30" placeholder="选填">
        </label>
        <label class="cm-field">QQ
          <input id="cm-qq" value="${c && c.contact ? GM.escapeHtml(c.contact.qq || '') : ''}" maxlength="16" placeholder="选填">
        </label>
        <label class="cm-field">邮箱
          <input id="cm-email" value="${c && c.contact ? GM.escapeHtml(c.contact.email || '') : ''}" maxlength="40" placeholder="选填">
        </label>
        <div class="cm-field">头像底色
          <div class="cm-colors" id="cm-colors">
            ${colors.map((col) => `
              <button type="button" class="cm-color ${(!c && col === colors[0]) || (c && c.color === col) ? 'active' : ''}"
                      data-color="${col}" style="background:${col}" aria-label="选择颜色 ${col}"></button>`).join('')}
          </div>
        </div>
        <div class="cm-field cm-field--full">头像（可上传照片）
          <div class="cm-avatar-row">
            <img id="cm-avatar-preview" src="${GM.avatarOf(c)}" alt="头像预览">
            <div class="cm-avatar-ops">
              <label class="btn">上传图片<input type="file" id="cm-avatar-file" accept="image/*" style="display:none"></label>
              <button type="button" class="btn" id="cm-avatar-reset">恢复默认头像</button>
              <span class="cm-geo-status" id="cm-avatar-status"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="cm-picker">
        <div class="cm-picker__label">在地图上点击，标记 TA 所在的位置
          <span class="cm-coords" id="cm-coords">${c && c.coords ? c.coords[0].toFixed(2) + ', ' + c.coords[1].toFixed(2) : '尚未标记'}</span>
        </div>
        <svg id="cm-picker-svg" viewBox="0 0 1000 718" preserveAspectRatio="xMidYMid meet"></svg>
        <button class="btn cm-snap" id="cm-snap" style="display:none">使用城市「<span id="cm-snap-city"></span>」的现有坐标</button>
      </div>
      <div class="cm-actions">
        <button class="btn btn--solid" id="cm-save">保存</button>
        <button class="btn" id="cm-cancel">取消</button>
      </div>
    </div>`;
  },

  /* ---------- 信件编辑器 ---------- */
  _editLetter: null,

  letterEditorHtml(l) {
    const cs = GM_DATA.classmates || [];
    const opts = cs.map((c) => {
      const has = (GM_DATA.letters || []).some((x) => x.id === c.id && (!l || l.id !== c.id));
      return `<option value="${GM.escapeHtml(c.name)}" data-id="${GM.escapeHtml(c.id)}"
        ${l && l.id === c.id ? 'selected' : ''}${has ? ' disabled' : ''}>${GM.escapeHtml(c.name)}${has ? '（已有信）' : ''}</option>`;
    }).join('');
    return `
    <div class="cm-editor">
      <h3 class="cm-editor__title">${l ? '编辑写给 ' + GM.escapeHtml(l.to) + ' 的信' : '新增信件'}</h3>
      <div class="cm-grid">
        <label class="cm-field">收信人 *
          <select id="lt-to" ${l ? 'disabled' : ''}>
            ${l ? `<option selected>${GM.escapeHtml(l.to)}</option>` : opts}
          </select>
        </label>
        <label class="cm-field">写信人
          <input id="lt-from" value="${l ? GM.escapeHtml(l.from || '') : ''}" maxlength="16" placeholder="如：陈一凡">
        </label>
        <label class="cm-field">日期
          <input id="lt-date" value="${l ? GM.escapeHtml(l.date || '') : ''}" maxlength="16" placeholder="如：2026.06.12">
        </label>
        <label class="cm-field">密码 ${l ? '（留空保持原密码）' : '*'}
          <input id="lt-password" maxlength="32" placeholder="${l ? '不修改则留空' : '为这封信设置密码'}"
                 autocomplete="new-password">
        </label>
        <label class="cm-field cm-field--full">正文 *
          <textarea id="lt-body" rows="14" maxlength="2000" placeholder="写下想说的话……">${l ? GM.escapeHtml(GM.b64Decode(l.bodyB64)) : ''}</textarea>
        </label>
      </div>
      <p class="admin-sub" id="lt-pw-hint" style="margin-top:12px"></p>
      <div class="cm-actions">
        <button class="btn btn--solid" id="lt-save">保存</button>
        <button class="btn" id="lt-cancel">取消</button>
      </div>
    </div>`;
  },

  /* ---------- 面板装配 ---------- */
  async mountPanel() {
    /* 云端登录用户按角色显示：班级成员看不到管理员专属区 */
    if (GM.cloud.ready && GM.cloud.signedIn) {
      const isAdmin = await GM.cloud.isAdmin();
      GM.$$('.set-sec[data-role="admin"]').forEach((sec) => {
        sec.style.display = isAdmin ? '' : 'none';
      });
    }

    GM.$('#admin-stats').innerHTML = this.statsHtml();
    GM.$('#admin-cm-list').innerHTML = this.listHtml();
    GM.$('#admin-lt-list').innerHTML = this.lettersListHtml();

    /* 撤销按钮显隐 */
    GM.$('#admin-cm-reset').style.display = GM.dataStore.hasChanges(GM.dataStore.SCOPES.classmates) ? '' : 'none';
    GM.$('#admin-lt-reset').style.display = GM.dataStore.hasChanges(GM.dataStore.SCOPES.letters) ? '' : 'none';

    /* 环境信息 */
    const env = GM.$('#admin-env');
    if (env) {
      const keys = Object.keys(localStorage).map((k) => `${k}=${localStorage.getItem(k)}`).join(' · ') || '（空）';
      env.innerHTML = `
        <div class="admin-env__row"><span>当前路由</span><code>#${GM.router.current || '/'}</code></div>
        <div class="admin-env__row"><span>主题</span><code>${GM.theme.current()}</code></div>
        <div class="admin-env__row"><span>开屏动画</span><code>${localStorage.getItem('gm-intro') === 'off' ? '关闭' : '开启'}</code></div>
        <div class="admin-env__row"><span>音乐曲目</span><code>${GM.music.current().title}</code></div>
        <div class="admin-env__row"><span>视口</span><code>${innerWidth} × ${innerHeight}</code></div>
        <div class="admin-env__row admin-env__row--wrap"><span>本地存储</span><code>${GM.escapeHtml(keys)}</code></div>`;
    }

    /* 快捷操作 */
    GM.$('#admin-clear-all').addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.removeItem('gm-admin');
      GM.toast('本地设置已清空。');
      setTimeout(() => GM.router.navigate('/'), 600);
    });
    GM.$('#admin-reset-letters').addEventListener('click', () => {
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith('gm-letter-'));
      keys.forEach((k) => sessionStorage.removeItem(k));
      GM.toast(keys.length ? '信件已重新封好。' : '没有已开启的信件。');
    });
    GM.$('#admin-export').addEventListener('click', () => this.exportData());
    GM.$('#admin-lock').addEventListener('click', () => {
      sessionStorage.removeItem('gm-admin');
      GM.toast('控制台已锁定。');
      setTimeout(() => GM.router.navigate('/'), 600);
    });

    /* 同学管理 */
    this.bindCmList();
    GM.$('#admin-cm-add').addEventListener('click', () => this.openEditor(null));
    GM.$('#admin-cm-export').addEventListener('click', () => this.exportClassmates());
    GM.$('#admin-cm-reset').addEventListener('click', () => {
      GM.dataStore.resetAll(GM.dataStore.SCOPES.classmates);
      this.refreshCm();
      GM.toast('已撤销同学的本地修改。');
    });
    /* 批量：按城市名自动识别所有未标记位置的同学 */
    GM.$('#admin-cm-autogeo').addEventListener('click', async () => {
      let ok = 0;
      const miss = [];
      for (const c of (GM_DATA.classmates || [])) {
        if (c.coords) continue;
        const hit = c.city ? GM.geo.match(c.city) : null;
        if (!hit) { if (c.city) miss.push(c.name); continue; }
        const updated = Object.assign({}, c, { coords: [hit[1], hit[2]], province: c.province || hit[3] });
        if (GM.cloud.ready) {
          try {
            await GM.cloud.saveClassmate(updated);
            const idx = GM_DATA.classmates.findIndex((x) => x.id === updated.id);
            if (idx >= 0) GM_DATA.classmates[idx] = updated;
            ok++;
          } catch (err) { miss.push(c.name); }
        } else {
          GM.dataStore.saveItem(GM.dataStore.SCOPES.classmates, updated);
          ok++;
        }
      }
      this.refreshCm();
      GM.toast(ok
        ? '已为 ' + ok + ' 位同学自动标记位置' + (miss.length ? '；' + miss.length + ' 位未识别（' + miss.slice(0, 3).join('、') + (miss.length > 3 ? '…' : '') + '）' : '。')
        : '没有可自动识别的同学。');
    });

    /* 信件管理 */
    this.bindLettersList();
    GM.$('#admin-lt-add').addEventListener('click', () => this.openLetterEditor(null));
    GM.$('#admin-lt-export').addEventListener('click', () => this.exportLetters());
    GM.$('#admin-lt-reset').addEventListener('click', () => {
      GM.dataStore.resetAll(GM.dataStore.SCOPES.letters);
      this.refreshLetters();
      GM.toast('已撤销信件的本地修改。');
    });

    /* 云端同步 */
    this.mountCloud();
  },

  /* ---------- 云端同步区 ---------- */
  mountCloud() {
    const box = GM.$('#admin-cloud');
    if (!box) return;
    if (!GM.cloud.ready) {
      box.innerHTML = '<p class="admin-sub">云端未配置 —— 站点运行在本地模式。在 js/config.js 填入 Supabase 的 Project URL 与 anon 密钥后即可启用云端共享（详见 README「Supabase 云端部署」）。</p>';
      return;
    }
    box.innerHTML = `
      <p class="admin-sub">云端已连接。登录后，编辑会直接保存到云端，所有人可见。</p>
      <div class="cloud-form">
        <input id="cloud-email" type="email" placeholder="邮箱" autocomplete="username">
        <input id="cloud-password" type="password" placeholder="密码" autocomplete="current-password">
        <button class="btn" id="cloud-signin">登录</button>
        <button class="btn" id="cloud-signup">注册</button>
      </div>
      <p class="admin-sub" id="cloud-msg"></p>`;
    const msg = GM.$('#cloud-msg');
      const doAuth = async (mode) => {
      const email = GM.$('#cloud-email').value.trim();
      const password = GM.$('#cloud-password').value;
      if (!email || !password) { msg.textContent = '请填写邮箱和密码（至少 6 位）。'; return; }
      msg.textContent = mode === 'signin' ? '正在登录……' : '正在注册……';
      try {
        if (mode === 'signin') await GM.cloud.signIn(email, password);
        else await GM.cloud.signUp(email, password);
        /* 重新渲染整个控制台，按角色显示分区 */
        const app = GM.$('#app');
        app.innerHTML = this.panel();
        GM.scrollReveal(app);
        await this.mountPanel();
      } catch (e) {
        msg.textContent = (mode === 'signin' ? '登录失败' : '注册失败') + '：' + (e.message || '请检查邮箱密码');
      }
    };
    GM.$('#cloud-signin').addEventListener('click', () => doAuth('signin'));
    GM.$('#cloud-signup').addEventListener('click', () => doAuth('signup'));
    this.refreshCloudAuth(box);
  },

  async refreshCloudAuth(box) {
    try {
      const { data: { user } } = await GM.cloud.client.auth.getUser();
      if (!user) return;
      const isAdmin = await GM.cloud.isAdmin();
      box.innerHTML = `
        <p class="admin-sub">已登录：<b>${GM.escapeHtml(user.email)}</b>（${isAdmin ? '管理员' : '班级成员'}）</p>
        <p class="admin-sub">${isAdmin ? '你可以编辑同学、信件与头像。' : '班级成员可以：在留言板留言、在同学个人页留言。同学名单与信件由管理员维护。'}</p>
        <button class="btn" id="cloud-signout">退出登录</button>`;
      GM.$('#cloud-signout').addEventListener('click', async () => {
        await GM.cloud.signOut();
        this.mountCloud();
      });
    } catch (e) { /* 未登录 */ }
  },

  /* 刷新数据总览 + 同学列表 */
  refreshCm() {
    GM.$('#admin-stats').innerHTML = this.statsHtml();
    GM.$('#admin-cm-list').innerHTML = this.listHtml();
    this.bindCmList();
    GM.$('#admin-cm-reset').style.display =
      (GM.cloud.ready || !GM.dataStore.hasChanges(GM.dataStore.SCOPES.classmates)) ? 'none' : '';
  },

  refreshLetters() {
    GM.$('#admin-stats').innerHTML = this.statsHtml();
    GM.$('#admin-lt-list').innerHTML = this.lettersListHtml();
    this.bindLettersList();
    GM.$('#admin-lt-reset').style.display =
      (GM.cloud.ready || !GM.dataStore.hasChanges(GM.dataStore.SCOPES.letters)) ? 'none' : '';
  },

  bindCmList() {
    GM.$$('#admin-cm-list .cm-row').forEach((row) => {
      const id = row.dataset.id;
      const c = (GM_DATA.classmates || []).find((x) => x.id === id);
      if (!c) return;
      row.querySelector('[data-op="edit"]').addEventListener('click', () => this.openEditor(c));
      const delBtn = row.querySelector('[data-op="del"]');
      delBtn.addEventListener('click', async () => {
        if (delBtn.dataset.confirm) {
          if (GM.cloud.ready) {
            try {
              await GM.cloud.removeClassmate(id);
              GM_DATA.classmates = GM_DATA.classmates.filter((x) => x.id !== id);
            } catch (err) {
              GM.toast('云端删除失败：请先登录。');
              return;
            }
          } else {
            GM.dataStore.removeItem(GM.dataStore.SCOPES.classmates, id);
          }
          this.refreshCm();
          GM.toast('已删除 ' + c.name + '。');
        } else {
          delBtn.dataset.confirm = '1';
          delBtn.textContent = '确认删除?';
          setTimeout(() => { if (delBtn.dataset.confirm) { delete delBtn.dataset.confirm; delBtn.textContent = '删除'; } }, 2600);
        }
      });
    });
  },

  bindLettersList() {
    GM.$$('#admin-lt-list .cm-row').forEach((row) => {
      const id = row.dataset.id;
      const l = (GM_DATA.letters || []).find((x) => x.id === id);
      if (!l) return;
      row.querySelector('[data-op="edit"]').addEventListener('click', () => this.openLetterEditor(l));
      const delBtn = row.querySelector('[data-op="del"]');
      delBtn.addEventListener('click', async () => {
        if (delBtn.dataset.confirm) {
          if (GM.cloud.ready) {
            try {
              await GM.cloud.removeLetter(id);
              GM_DATA.letters = GM_DATA.letters.filter((x) => x.id !== id);
            } catch (err) {
              GM.toast('云端删除失败：仅管理员可删除信件。');
              return;
            }
          } else {
            GM.dataStore.removeItem(GM.dataStore.SCOPES.letters, id);
          }
          this.refreshLetters();
          GM.toast('已删除写给 ' + l.to + ' 的信。');
        } else {
          delBtn.dataset.confirm = '1';
          delBtn.textContent = '确认删除?';
          setTimeout(() => { if (delBtn.dataset.confirm) { delete delBtn.dataset.confirm; delBtn.textContent = '删除'; } }, 2600);
        }
      });
    });
  },

  /* ---------- 同学编辑器挂载 ---------- */
  openEditor(c) {
    this._edit = c
      ? { id: c.id, coords: c.coords ? c.coords.slice() : null, color: c.color || this.COLORS[0], province: c.province || '', avatar: c.avatar || '', manual: false }
      : { id: null, coords: null, color: this.COLORS[0], province: '', avatar: '', manual: false };
    GM.$('#admin-cm-editor').innerHTML = this.editorHtml(c);
    this.mountEditor();
    GM.$('#admin-cm-editor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  mountEditor() {
    /* 头像上传 / 恢复默认 */
    const avatarFile = GM.$('#cm-avatar-file');
    const avatarPreview = GM.$('#cm-avatar-preview');
    const avatarStatus = GM.$('#cm-avatar-status');
    if (avatarFile) {
      avatarFile.addEventListener('change', async () => {
        const file = avatarFile.files && avatarFile.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { avatarStatus.textContent = '图片超过 2MB，请压缩后再传。'; return; }
        avatarStatus.textContent = '正在上传……';
        try {
          const url = await GM.cloud.uploadAvatar(file);
          const old = this._edit.avatar;
          this._edit.avatar = url;
          avatarPreview.src = url;
          avatarStatus.textContent = '已上传，保存后生效。';
          if (old) GM.cloud.removeAvatar(old);
        } catch (e) {
          avatarStatus.textContent = '上传失败（仅管理员可上传头像）。';
        }
      });
      GM.$('#cm-avatar-reset').addEventListener('click', () => {
        const old = this._edit.avatar;
        this._edit.avatar = '';
        avatarPreview.src = GM.avatar(this._edit.name || GM.$('#cm-name').value || '?', this._edit.color);
        avatarStatus.textContent = '已恢复默认头像，保存后生效。';
        if (old) GM.cloud.removeAvatar(old);
      });
    }

    /* 颜色选择 */
    GM.$$('#cm-colors .cm-color').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._edit.color = btn.dataset.color;
        GM.$$('#cm-colors .cm-color').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    /* 迷你地图选点 */
    const svg = GM.$('#cm-picker-svg');
    this.renderPicker(svg);

    /* 城市同名 → 提供坐标同步 */
    const cityInput = GM.$('#cm-city');
    const snapBtn = GM.$('#cm-snap');
    const syncSnap = () => {
      const city = cityInput.value.trim();
      const exist = (GM_DATA.classmates || []).find((x) => x.city === city && x.coords);
      if (exist && city) {
        GM.$('#cm-snap-city').textContent = city;
        snapBtn.style.display = '';
        snapBtn._city = city;
      } else {
        snapBtn.style.display = 'none';
      }
    };
    const debouncedAuto = GM.debounce(() => this.autoLocate(), 400);
    cityInput.addEventListener('input', () => {
      syncSnap();
      this._edit.manual = false; /* 换了城市名 → 重新自动识别 */
      debouncedAuto();
    });
    snapBtn.addEventListener('click', () => {
      const exist = (GM_DATA.classmates || []).find((x) => x.city === snapBtn._city && x.coords);
      if (exist) {
        this._edit.coords = exist.coords.slice();
        this.updatePickerMarker();
      }
    });
    syncSnap();
    this.autoLocate();

    /* 联网识别兜底 */
    GM.$('#cm-geo-online').addEventListener('click', async () => {
      const status = GM.$('#cm-geo-status');
      const city = cityInput.value.trim();
      if (!city) return;
      status.textContent = '正在联网识别……';
      try {
        const res = await fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(city + ' 中国') + '&limit=1',
          { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const f = data.features && data.features[0];
        if (f && f.geometry && f.geometry.coordinates) {
          const [lng, lat] = f.geometry.coordinates;
          this._edit.coords = [Math.round(lng * 100) / 100, Math.round(lat * 100) / 100];
          this._edit.manual = true;
          this.updatePickerMarker();
          status.textContent = '联网识别成功（' + this._edit.coords[0] + ', ' + this._edit.coords[1] + '）';
        } else {
          status.textContent = '联网未找到「' + city + '」，请在地图上手动标记。';
        }
      } catch (err) {
        status.textContent = '联网识别失败，请在地图上手动标记。';
      }
    });

    /* 保存 / 取消 */
    GM.$('#cm-save').addEventListener('click', () => this.saveEditor());
    GM.$('#cm-cancel').addEventListener('click', () => {
      GM.$('#admin-cm-editor').innerHTML = '';
      this._edit = null;
    });
  },

  /* 迷你地图：省界 + 选中标记 */
  renderPicker(svg) {
    const china = GM_DATA.china;
    if (!china || !china.provinces) return;
    const d = china.provinces
      .flatMap(([, rings]) => rings)
      .map((ring) =>
        'M' + ring.map((p) => GM.pages.map.project(p[0], p[1]).map((n) => n.toFixed(1)).join(',')).join('L') + 'Z')
      .join('');
    svg.innerHTML = `
      <path class="map-land" d="${d}" fill-rule="evenodd"></path>
      <path class="map-land-lines" d="${d}" fill-rule="evenodd"></path>
      <g id="cm-picker-marker"></g>`;

    svg.addEventListener('click', (e) => {
      const r = svg.getBoundingClientRect();
      const x = (e.clientX - r.left) * (1000 / r.width);
      const y = (e.clientY - r.top) * (718 / r.height);
      const b = GM_DATA.map.bounds;
      this._edit.coords = [
        Math.round((b.lngMin + (x / 1000) * (b.lngMax - b.lngMin)) * 100) / 100,
        Math.round((b.latMax - (y / 718) * (b.latMax - b.latMin)) * 100) / 100
      ];
      this._edit.manual = true; /* 手动点图优先于自动识别 */
      const status = GM.$('#cm-geo-status');
      if (status) status.textContent = '已手动标记（' + this._edit.coords[0] + ', ' + this._edit.coords[1] + '）';
      this.updatePickerMarker();
    });
    this.updatePickerMarker();
  },

  updatePickerMarker() {
    const g = GM.$('#cm-picker-marker');
    const coordsEl = GM.$('#cm-coords');
    if (!g || !coordsEl) return;
    const coords = this._edit.coords;
    if (!coords) {
      g.innerHTML = '';
      coordsEl.textContent = '尚未标记';
      return;
    }
    const [x, y] = GM.pages.map.project(coords[0], coords[1]);
    g.innerHTML = `
      <circle class="cm-marker-halo" cx="${x}" cy="${y}" r="16"></circle>
      <circle class="cm-marker" cx="${x}" cy="${y}" r="7"></circle>`;
    coordsEl.textContent = coords[0].toFixed(2) + ', ' + coords[1].toFixed(2);
  },

  /* 城市名 → 自动识别坐标（内置城市库；手动点图优先） */
  autoLocate() {
    const status = GM.$('#cm-geo-status');
    const onlineBtn = GM.$('#cm-geo-online');
    if (!status) return;
    if (this._edit.manual) return;
    const city = GM.$('#cm-city').value.trim();
    if (!city) {
      status.textContent = '';
      onlineBtn.style.display = 'none';
      return;
    }
    const hit = GM.geo.match(city);
    if (hit) {
      this._edit.coords = [hit[1], hit[2]];
      this._edit.province = hit[3];
      this.updatePickerMarker();
      status.textContent = '已自动识别：' + hit[0] + '（' + hit[1] + ', ' + hit[2] + '）';
      onlineBtn.style.display = 'none';
    } else {
      status.textContent = '本地未收录「' + city + '」，可在地图上手动标记';
      onlineBtn.style.display = '';
    }
  },

  async saveEditor() {
    const e = this._edit;
    const name = GM.$('#cm-name').value.trim();
    if (!name) { GM.toast('请先填写姓名。'); GM.$('#cm-name').focus(); return; }
    if (!e.coords) { GM.toast('请在地图上标记 TA 的位置（或输入可识别的城市名）。'); return; }
    const city = GM.$('#cm-city').value.trim();
    const exist = city ? (GM_DATA.classmates || []).find((x) => x.city === city) : null;
    const c = {
      id: e.id || ('cm-' + Date.now().toString(36)),
      name,
      gender: GM.$('#cm-gender').value,
      city,
      province: exist ? exist.province : (e.province || ''),
      coords: e.coords,
      university: GM.$('#cm-uni').value.trim(),
      major: GM.$('#cm-major').value.trim(),
      quote: GM.$('#cm-quote').value.trim(),
      tags: GM.$('#cm-tags').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      color: e.color,
      avatar: e.avatar || '',
      contact: {
        wechat: GM.$('#cm-wechat').value.trim(),
        qq: GM.$('#cm-qq').value.trim(),
        email: GM.$('#cm-email').value.trim()
      }
    };
    if (GM.cloud.ready) {
      try {
        await GM.cloud.saveClassmate(c);
        const idx = GM_DATA.classmates.findIndex((x) => x.id === c.id);
        if (idx >= 0) GM_DATA.classmates[idx] = c;
        else GM_DATA.classmates.push(c);
      } catch (err) {
        GM.toast('云端保存失败：请先在「云端同步」登录。');
        return;
      }
    } else {
      GM.dataStore.saveItem(GM.dataStore.SCOPES.classmates, c);
    }
    GM.$('#admin-cm-editor').innerHTML = '';
    this._edit = null;
    this.refreshCm();
    GM.toast(e.id ? '已保存 ' + name + ' 的修改。' : '已加入 ' + name + '。');
  },

  /* ---------- 信件编辑器挂载 ---------- */
  async openLetterEditor(l) {
    /* 云端信件：经管理员接口取全文（仅 admins 表内用户） */
    if (l && l.cloud && GM.cloud.ready) {
      try {
        const full = await GM.cloud.adminGetLetter(l.id);
        if (!full) { GM.toast('仅管理员可编辑云端信件。'); return; }
        l = {
          id: full.id, to: full.recipient, from: full.sender, date: full.letter_date,
          passwordHash: full.password_hash, bodyB64: full.body_b64
        };
      } catch (e) {
        GM.toast('仅管理员可编辑云端信件（请以管理员账号登录）。');
        return;
      }
    }
    this._editLetter = l ? { id: l.id, passwordHash: l.passwordHash } : { id: null, passwordHash: null };
    GM.$('#admin-lt-editor').innerHTML = this.letterEditorHtml(l);
    this.mountLetterEditor();
    GM.$('#admin-lt-editor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  mountLetterEditor() {
    /* 密码强度提示 */
    const pwInput = GM.$('#lt-password');
    const hint = GM.$('#lt-pw-hint');
    pwInput.addEventListener('input', () => {
      const v = pwInput.value;
      if (!v) { hint.textContent = ''; return; }
      hint.textContent = v.length < 6
        ? '密码太短（至少 6 位），收信人容易猜中。'
        : '密码长度 ' + v.length + ' 位，保存时将转为 SHA-256 哈希。';
    });

    GM.$('#lt-save').addEventListener('click', async () => this.saveLetterEditor());
    GM.$('#lt-cancel').addEventListener('click', () => {
      GM.$('#admin-lt-editor').innerHTML = '';
      this._editLetter = null;
    });
  },

  async saveLetterEditor() {
    const e = this._editLetter;
    const sel = GM.$('#lt-to');
    const to = e.id
      ? (GM_DATA.classmates.find((c) => c.id === e.id) || {}).name || (GM_DATA.letters.find((l) => l.id === e.id) || {}).to
      : sel.options[sel.selectedIndex].text;
    const toId = e.id
      ? e.id
      : sel.options[sel.selectedIndex].dataset.id;
    const body = GM.$('#lt-body').value.trim();
    const pw = GM.$('#lt-password').value.trim();

    if (!to) { GM.toast('请选择收信人。'); return; }
    if (!body) { GM.toast('正文不能为空。'); GM.$('#lt-body').focus(); return; }
    if (!e.id && !toId) { GM.toast('请选择收信人。'); return; }
    if (!e.id && (GM_DATA.letters || []).some((l) => l.id === toId)) {
      GM.toast('TA 已经有一封信了，请在列表里编辑。'); return;
    }
    if (!e.id && !pw) { GM.toast('新信件需要设置密码。'); GM.$('#lt-password').focus(); return; }
    if (pw && pw.length < 6) { GM.toast('密码至少 6 位。'); GM.$('#lt-password').focus(); return; }

    const l = {
      id: toId || e.id,
      to,
      from: GM.$('#lt-from').value.trim(),
      date: GM.$('#lt-date').value.trim(),
      passwordHash: pw ? await GM.sha256(pw) : e.passwordHash,
      bodyB64: GM.b64Encode(body)
    };
    if (GM.cloud.ready) {
      try {
        await GM.cloud.saveLetter(l);
        const idx = GM_DATA.letters.findIndex((x) => x.id === l.id);
        const meta = { id: l.id, to: l.to, from: l.from, date: l.date, cloud: true };
        if (idx >= 0) GM_DATA.letters[idx] = meta;
        else GM_DATA.letters.push(meta);
      } catch (err) {
        GM.toast('云端保存失败：仅管理员可编辑信件。');
        return;
      }
    } else {
      GM.dataStore.saveItem(GM.dataStore.SCOPES.letters, l);
    }
    GM.$('#admin-lt-editor').innerHTML = '';
    this._editLetter = null;
    this.refreshLetters();
    GM.toast('已保存写给 ' + to + ' 的信。');
  },

  /* ---------- 导出 ---------- */
  exportClassmates() {
    const blob = new Blob([GM.dataStore.exportFileContent(GM.dataStore.SCOPES.classmates)], { type: 'text/javascript;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'classmates.js';
    a.click();
    URL.revokeObjectURL(a.href);
    GM.toast('classmates.js 已下载，替换 data/ 下同名文件即可永久生效。');
  },

  exportLetters() {
    const blob = new Blob([GM.dataStore.exportFileContent(GM.dataStore.SCOPES.letters)], { type: 'text/javascript;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'letters.js';
    a.click();
    URL.revokeObjectURL(a.href);
    GM.toast('letters.js 已下载，替换 data/ 下同名文件即可永久生效。');
  },

  /* 导出 GM_DATA 为 JSON 备份 */
  exportData() {
    const data = {};
    Object.keys(GM_DATA).forEach((k) => { data[k] = GM_DATA[k]; });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'graduation-memory-data-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
    GM.toast('数据备份已开始下载。');
  }
};

GM.router.register('/admin', () => GM.pages.admin.render());
GM.bus.on('route:change', (info) => {
  if (info.path === '/admin') {
    if (GM.pages.admin.canEnter()) GM.pages.admin.mountPanel();
    else GM.pages.admin.mountGate();
  }
});
