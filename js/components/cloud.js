/* ============================================
   云端同步层（Supabase）
   - 未配置 / 加载失败 → ready=false，站点回退本地模式
   - 配置成功 → 同学/信件/留言读写走云端，登录后可编辑
   安全模型见 supabase-setup.sql（RLS + 服务端密码校验）
   ============================================ */
GM.cloud = {
  ready: false,
  signedIn: false,
  adminFlag: false,
  client: null,

  async init() {
    const url = GM_CONFIG.supabaseUrl;
    const key = GM_CONFIG.supabaseAnonKey;
    if (!url || !key) return false;
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.onload = resolve;
        s.onerror = () => reject(new Error('supabase js load failed'));
        /* CDN 不可达时快速失败（8s），回退本地模式，不让站点挂起 */
        const timer = setTimeout(() => { s.remove(); reject(new Error('supabase js timeout')); }, 8000);
        s.onload = () => { clearTimeout(timer); resolve(); };
        document.head.appendChild(s);
      });
      this.client = window.supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      this.ready = true;

      /* 登录状态同步（供控制台/页面入口判断） */
      this.client.auth.onAuthStateChange(async (event, session) => {
        this.signedIn = !!session;
        this.adminFlag = this.signedIn ? await this.isAdmin() : false;
        GM.bus.emit('auth:change', this.signedIn);
      });
      try {
        const { data } = await this.client.auth.getUser();
        this.signedIn = !!(data && data.user);
        this.adminFlag = this.signedIn ? await this.isAdmin() : false;
      } catch (e) { this.signedIn = false; this.adminFlag = false; }

      await this.syncDown();
      return true;
    } catch (e) {
      this.ready = false;
      return false;
    }
  },

  /* 云端数据 → GM_DATA（云端为唯一来源） */
  async syncDown() {
    try {
      const { data: cs, error: e1 } = await this.client.from('classmates').select('id, data');
      if (!e1 && cs) {
        GM_DATA.classmates = cs.map((r) => GM.normClassmate(Object.assign({ id: r.id }, r.data || {})));
        GM_DATA.classmatesBase = GM_DATA.classmates;
      }
      const { data: ls, error: e2 } = await this.client.rpc('list_letters');
      if (!e2 && ls) {
        GM_DATA.letters = ls.map((r) => ({
          id: r.id, to: r.recipient, from: r.sender, date: r.letter_date, cloud: true
        }));
        GM_DATA.lettersBase = GM_DATA.letters;
      }
    } catch (e) { /* 保持本地数据 */ }
  },

  /* ---------- 同学 ---------- */
  async saveClassmate(c) {
    const { error } = await this.client.from('classmates').upsert({ id: c.id, data: c });
    if (error) throw error;
  },

  async removeClassmate(id) {
    const { error } = await this.client.from('classmates').delete().eq('id', id);
    if (error) throw error;
  },

  /* ---------- 信件 ---------- */
  /* 管理员编辑用：取全文（含哈希/正文；仅 admins 表内用户可调） */
  async adminGetLetter(id) {
    const { data, error } = await this.client.rpc('admin_get_letter', { p_id: id });
    if (error) throw error;
    return data && data[0] ? data[0] : null;
  },

  /* 管理员保存信件（哈希由本地计算） */
  async saveLetter(l) {
    const { error } = await this.client.from('letters').upsert({
      id: l.id, recipient: l.to, sender: l.from || '', letter_date: l.date || '',
      password_hash: l.passwordHash, body_b64: l.bodyB64
    });
    if (error) throw error;
  },

  async removeLetter(id) {
    const { error } = await this.client.from('letters').delete().eq('id', id);
    if (error) throw error;
  },

  /* 匿名/登录用户开信：服务端校验密码 */
  async openLetter(id, password) {
    const { data, error } = await this.client.rpc('open_letter', { p_id: id, p_password: password });
    if (error) {
      if (error.message && error.message.indexOf('LETTER_LOCKED') >= 0) return { locked: true };
      return { wrong: true };
    }
    return { ok: true, letter: data && data[0] ? data[0] : null };
  },

  /* ---------- 留言 ---------- */
  async fetchMessages() {
    const { data, error } = await this.client
      .from('messages').select('id, author, content, created_at')
      .order('id', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  },

  async addMessage(author, content) {
    const { error } = await this.client.from('messages').insert({ author, content });
    if (error) throw error;
  },

  /* ---------- 个人留言（同学个人页） ---------- */
  async fetchProfileMessages(classmateId) {
    const { data, error } = await this.client
      .from('profile_messages').select('id, author, content, created_at')
      .eq('classmate_id', classmateId)
      .order('id', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  },

  async addProfileMessage(classmateId, author, content) {
    const { error } = await this.client
      .from('profile_messages').insert({ classmate_id: classmateId, author, content });
    if (error) throw error;
  },

  /* ---------- 头像上传（avatars 桶，公开读 / 管理员写） ---------- */
  async uploadAvatar(file) {
    const safe = (file.name || 'avatar').replace(/[^\w.\-]/g, '_');
    const path = 'u-' + Date.now() + '-' + safe;
    const { error } = await this.client.storage
      .from('avatars').upload(path, file, { contentType: file.type || 'image/jpeg' });
    if (error) throw error;
    const { data } = this.client.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  async removeAvatar(url) {
    try {
      const m = String(url).match(/avatars\/([^?]+)/);
      if (m) await this.client.storage.from('avatars').remove([decodeURIComponent(m[1])]);
    } catch (e) { /* 清理失败不阻塞 */ }
  },

  /* ---------- 认证 ---------- */
  user() { return this.client ? this.client.auth.getUser() : null; },

  async signIn(email, password) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp(email, password) {
    const { error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
  },

  async signOut() { await this.client.auth.signOut(); },

  /* 当前用户是否为管理员（admins 表 RLS 仅本人可见） */
  async isAdmin() {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      if (!user) return false;
      const { data } = await this.client.from('admins').select('user_id').eq('user_id', user.id);
      return !!(data && data.length);
    } catch (e) { return false; }
  }
};
