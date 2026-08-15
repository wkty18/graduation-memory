/* ============================================
   站点配置
   启用云端同步（Supabase）：
     1. 在 supabase.com 创建项目
     2. Project Settings → API 里复制 Project URL 和 anon public 密钥
     3. 填到下面两个引号里
   不填则站点运行在「本地模式」：全部功能照常，
   编辑保存在本浏览器（导出文件可永久生效）。
   ============================================ */
window.GM_CONFIG = {
  supabaseUrl: 'https://qjxsawkakhlnoxeijnmx.supabase.co',
  supabaseAnonKey: 'sb_publishable_acx84qWSW1ja3HSGhscRlQ_7Pog9u3i',

  /* 背景音乐曲目表：
     - file：上传到 Supabase Storage → audio 桶里的文件名（支持中文名）
     - title：设置页里显示的歌名
     - local：本地备用文件（audio 桶不可用时自动回退）
     想加歌/换歌：把 mp3 传到 audio 桶，照格式加一行即可 */
  musicTracks: [
    { file: 'bgm.mp3', title: '毕业演讲 · 背景音乐', local: 'assets/archive/graduation-2026/bgm.mp3' },
    { file: 'jinian.mp3', title: '纪念', local: 'assets/archive/graduation-2026/jinian.mp3' },
    { file: 'dengnixiake.mp3', title: '等你下课', local: '' },
    { file: 'yujian.mp3', title: '遇见', local: '' }
  ]
};
