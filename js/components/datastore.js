/* ============================================
   数据覆盖层（管理员编辑用）
   静态站没有后端，管理员在控制台里对「同学」「信件」的
   增删改保存在 localStorage 的覆盖层中，页面加载时与
   data/ 下的基础数据合并：
     merged = base − remove + update + add
   导出对应文件（classmates.js / letters.js）替换 data/
   下同名文件后，修改即对所有人永久生效。
   ============================================ */
GM.dataStore = {
  SCOPES: {
    classmates: {
      key: 'gm-classmates-overlay',
      dataKey: 'classmates',
      baseKey: 'classmatesBase',
      file: 'classmates.js',
      label: '同学数据',
      fileHeader: '/* ============================================\n'
        + '   同学数据 · 由纪念馆控制台导出（含本地编辑）\n'
        + '   替换 data/classmates.js 后，修改对所有人永久生效\n'
        + '   ============================================ */\n'
    },
    letters: {
      key: 'gm-letters-overlay',
      dataKey: 'letters',
      baseKey: 'lettersBase',
      file: 'letters.js',
      label: '信件数据',
      fileHeader: '/* ============================================\n'
        + '   信件数据 · 由纪念馆控制台导出（含本地编辑）\n'
        + '   ------------------------------------------------------------\n'
        + '   【安全性说明】这是「前端访问限制」，不是真正的安全系统：\n'
        + '   - 密码以 SHA-256 哈希存储，不出现明文\n'
        + '   - 信件正文以 Base64 编码，避免顺手翻源码时直接读到\n'
        + '   - 但任何能打开浏览器开发者工具的人，理论上都能解开这些内容\n'
        + '   - 若未来需要真正的隐私保护，请迁移到后端方案\n'
        + '     （如 Supabase / Cloudflare Workers / 自建服务）\n'
        + '   ============================================================ */\n'
    }
  },

  _o: {},

  init() {
    Object.values(this.SCOPES).forEach((s) => {
      GM_DATA[s.baseKey] = GM_DATA[s.baseKey] || GM_DATA[s.dataKey] || [];
      this._o[s.dataKey] = this.load(s.key);
    });
    this.applyAll();
  },

  load(key) {
    try {
      const o = JSON.parse(localStorage.getItem(key));
      if (o && typeof o === 'object' && Array.isArray(o.add)) return o;
    } catch (e) { /* 损坏的覆盖层当作不存在 */ }
    return { add: [], update: {}, remove: [] };
  },

  save(scope) {
    try {
      localStorage.setItem(scope.key, JSON.stringify(this._o[scope.dataKey]));
    } catch (e) { GM.toast('保存失败：本地存储不可用。'); return; }
    this.applyAll();
  },

  applyAll() {
    Object.values(this.SCOPES).forEach((s) => {
      const base = GM_DATA[s.baseKey] || [];
      const o = this._o[s.dataKey];
      const merged = base
        .filter((c) => !o.remove.includes(c.id))
        .map((c) => (o.update[c.id] ? Object.assign({}, c, o.update[c.id]) : c))
        .concat(o.add.filter((a) => !o.remove.includes(a.id)));
      GM_DATA[s.dataKey] = s.dataKey === 'classmates' ? merged.map(GM.normClassmate) : merged;
    });
    GM.bus.emit('data:change');
  },

  /* 新增（base 中无此 id）或更新（base 中有此 id） */
  saveItem(scope, item) {
    const o = this._o[scope.dataKey];
    o.remove = o.remove.filter((id) => id !== item.id);
    if ((GM_DATA[scope.baseKey] || []).some((x) => x.id === item.id)) {
      o.update[item.id] = item;
    } else {
      const idx = o.add.findIndex((x) => x.id === item.id);
      if (idx >= 0) o.add[idx] = item;
      else o.add.push(item);
    }
    this.save(scope);
  },

  removeItem(scope, id) {
    const o = this._o[scope.dataKey];
    if (!o.remove.includes(id)) o.remove.push(id);
    delete o.update[id];
    o.add = o.add.filter((a) => a.id !== id);
    this.save(scope);
  },

  /* 撤销某类数据的全部本地修改，回到基础数据 */
  resetAll(scope) {
    this._o[scope.dataKey] = { add: [], update: {}, remove: [] };
    this.save(scope);
  },

  hasChanges(scope) {
    const o = this._o[scope.dataKey];
    return o.add.length > 0 || Object.keys(o.update).length > 0 || o.remove.length > 0;
  },

  /* 生成可替换 data/ 下同名文件的内容（含全部合并后数据） */
  exportFileContent(scope) {
    return scope.fileHeader
      + 'window.GM_DATA = window.GM_DATA || {};\n'
      + 'window.GM_DATA.' + scope.dataKey + ' = '
      + JSON.stringify(GM_DATA[scope.dataKey], null, 2)
      + ';\n';
  }
};
