/* ============================================
   相册数据 · 分类：高一 / 高二 / 高三 / 班级活动 / 校园日常 / 毕业 / 其他
   type: image | video | audio | iframe
   修改此文件即可增删回忆条目；图片请放 assets/ 下并更新路径
   ============================================ */
window.GM_DATA = window.GM_DATA || {};

window.GM_DATA.albumCategories = [
  { id: 'all', label: '全部', desc: '所有回忆。' },
  { id: 'grade1', label: '高一', desc: '第一次见面。' },
  { id: 'grade2', label: '高二', desc: '我们的青春。' },
  { id: 'grade3', label: '高三', desc: '最后一段高中时光。' },
  { id: 'activity', label: '班级活动', desc: '运动会、班会、团建。' },
  { id: 'daily', label: '校园日常', desc: '课堂、课间、食堂、操场。' },
  { id: 'graduation', label: '毕业', desc: '毕业照、毕业典礼、毕业演讲。' },
  { id: 'other', label: '其他', desc: '各种没有分类的珍贵回忆。' }
];

window.GM_DATA.albums = [
  /* ---------- 毕业 · 毕业演讲真实素材（原 毕业/ 文件夹） ---------- */
  {
    id: 'grad-01', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/photo-01.jpg',
    thumb: 'assets/archive/graduation-2026/photo-01_thumb.jpg',
    title: '毕业演讲 · 我们的三年', date: '2026.06.09', place: '毕业典礼',
    desc: '演讲台上，屏幕里放着这三年的照片。台下很安静。',
    participants: ['陈一凡', '林晓雨', '王子豪', '苏婉晴', '赵明轩', '周若彤', '吴凯文', '郑雅婷', '孙浩然', '高诗涵', '刘俊杰', '何梦瑶'],
    uploader: '陈一凡'
  },
  {
    id: 'grad-02', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/微信图片_20260523220742_26487_13.jpg',
    thumb: 'assets/archive/graduation-2026/微信图片_20260523220742_26487_13_thumb.jpg',
    title: '最后一节晚自习', date: '2026.05.23', place: '高三七班教室',
    desc: '谁都没有说话，谁都知道这是最后几夜了。',
    participants: ['全班同学'], uploader: '林晓雨'
  },
  {
    id: 'grad-03', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605012804.jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605012804_thumb.jpg',
    title: '典礼前夜', date: '2026.06.05', place: '学校礼堂',
    desc: '彩排到很晚，灯还亮着。',
    participants: ['陈一凡', '苏婉晴', '高诗涵'], uploader: '苏婉晴'
  },
  {
    id: 'grad-04', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605012836.jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605012836_thumb.jpg',
    title: '快门按下的瞬间', date: '2026.06.05', place: '校门口',
    desc: '大家挤在一起，喊了三遍茄子。',
    participants: ['全班同学'], uploader: '周若彤'
  },
  {
    id: 'grad-05', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605012916(24).jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605012916(24)_thumb.jpg',
    title: '散场之后', date: '2026.06.05', place: '操场',
    desc: '典礼结束，有人还坐在看台上没有走。',
    participants: ['吴凯文', '孙浩然', '刘俊杰'], uploader: '吴凯文'
  },
  {
    id: 'grad-06', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605013007(25).jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605013007(25)_thumb.jpg',
    title: '把校服折好', date: '2026.06.05', place: '教室',
    desc: '三年了，第一次把它叠得这么整齐。',
    participants: ['林晓雨', '郑雅婷', '何梦瑶'], uploader: '郑雅婷'
  },
  {
    id: 'grad-07', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605013022(12).jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605013022(12)_thumb.jpg',
    title: '那天天气很好', date: '2026.06.05', place: '校园',
    desc: '好到让人以为，明天还会照常上课。',
    participants: ['全班同学'], uploader: '赵明轩'
  },
  {
    id: 'grad-08', type: 'image', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ图片20260605013219(2).jpeg',
    thumb: 'assets/archive/graduation-2026/QQ图片20260605013219(2)_thumb.jpg',
    title: '写满名字的校服', date: '2026.06.05', place: '教室',
    desc: '每个名字都签得特别认真。',
    participants: ['全班同学'], uploader: '何梦瑶'
  },
  {
    id: 'grad-09', type: 'video', category: 'graduation',
    src: 'assets/archive/graduation-2026/QQ视频20260609163950(6).mp4',
    poster: 'assets/archive/graduation-2026/photo-01_thumb.jpg',
    title: '毕业演讲 · 完整记录', date: '2026.06.09', place: '毕业典礼',
    desc: '这段视频，留给很多年后的我们。',
    participants: ['全班同学'], uploader: '陈一凡'
  },
  {
    id: 'grad-10', type: 'iframe', category: 'graduation',
    src: 'assets/archive/graduation-2026/index.html',
    thumb: 'assets/archive/graduation-2026/photo-01_thumb.jpg',
    title: '毕业演讲 · 原版网页', date: '2026.06.09', place: '线上',
    desc: '典礼当天播放的章节页，原样保存在这里。',
    participants: ['全班同学'], uploader: '陈一凡'
  },
  {
    id: 'grad-11', type: 'audio', category: 'graduation',
    src: 'assets/archive/graduation-2026/bgm.mp3',
    title: '毕业演讲 · 背景音乐', date: '2026.06.09', place: '线上',
    desc: '前奏一响，就知道要上台了。',
    participants: [], uploader: '陈一凡'
  },
  {
    id: 'grad-12', type: 'audio', category: 'graduation',
    src: 'assets/archive/graduation-2026/jinian.mp3',
    title: '纪念', date: '2026.06.09', place: '线上',
    desc: '写给 2023级7班 的曲子。',
    participants: [], uploader: '高诗涵'
  },

  /* ---------- 模拟回忆（占位图，可替换为真实照片） ---------- */
  {
    id: 'm-01', type: 'image', category: 'grade1',
    src: 'assets/images/placeholder/chu-2023.svg',
    thumb: 'assets/images/placeholder/chu-2023.svg',
    title: '开学第一天', date: '2023.09.01', place: '七班教室',
    desc: '第一次踏进七班的教室，谁都不认识谁。',
    participants: ['全班同学'], uploader: '林晓雨'
  },
  {
    id: 'm-02', type: 'image', category: 'activity',
    src: 'assets/images/placeholder/ju-2023.svg',
    thumb: 'assets/images/placeholder/ju-2023.svg',
    title: '第一次团建', date: '2023.10.20', place: '郊外',
    desc: '烧烤、桌游，还有跑调的歌。',
    participants: ['周若彤', '吴凯文', '郑雅婷'], uploader: '周若彤'
  },
  {
    id: 'm-03', type: 'image', category: 'daily',
    src: 'assets/images/placeholder/du-2023.svg',
    thumb: 'assets/images/placeholder/du-2023.svg',
    title: '早读课', date: '2023.11.15', place: '教室',
    desc: '朗朗书声里，有人偷偷补作业。',
    participants: ['陈一凡', '高诗涵'], uploader: '高诗涵'
  },
  {
    id: 'm-04', type: 'image', category: 'activity',
    src: 'assets/images/placeholder/ben-2024.svg',
    thumb: 'assets/images/placeholder/ben-2024.svg',
    title: '春季运动会', date: '2024.04.18', place: '操场',
    desc: '4×100 接力，我们拿了第三名。',
    participants: ['吴凯文', '孙浩然', '赵明轩', '刘俊杰'], uploader: '吴凯文'
  },
  {
    id: 'm-05', type: 'image', category: 'daily',
    src: 'assets/images/placeholder/shi-2024.svg',
    thumb: 'assets/images/placeholder/shi-2024.svg',
    title: '食堂', date: '2024.05.22', place: '食堂二楼',
    desc: '糖醋里脊窗口的队伍，永远是最长的。',
    participants: ['王子豪', '孙浩然'], uploader: '孙浩然'
  },
  {
    id: 'm-06', type: 'image', category: 'grade2',
    src: 'assets/images/placeholder/xia-2024.svg',
    thumb: 'assets/images/placeholder/xia-2024.svg',
    title: '高二的夏天', date: '2024.07.03', place: '教室',
    desc: '风扇吱呀作响的那个下午，黑板上的公式还没擦。',
    participants: ['全班同学'], uploader: '赵明轩'
  },
  {
    id: 'm-07', type: 'image', category: 'activity',
    src: 'assets/images/placeholder/xiao-2024.svg',
    thumb: 'assets/images/placeholder/xiao-2024.svg',
    title: '元旦联欢会', date: '2024.12.31', place: '教室',
    desc: '那晚教室里的灯串，亮到了十一点。',
    participants: ['全班同学'], uploader: '周若彤'
  },
  {
    id: 'm-08', type: 'image', category: 'grade3',
    src: 'assets/images/placeholder/ye-2025.svg',
    thumb: 'assets/images/placeholder/ye-2025.svg',
    title: '晚自习', date: '2025.03.10', place: '教室',
    desc: '窗外是黑的，桌上堆满了卷子。',
    participants: ['全班同学'], uploader: '苏婉晴'
  },
  {
    id: 'm-09', type: 'image', category: 'grade3',
    src: 'assets/images/placeholder/guang-2025.svg',
    thumb: 'assets/images/placeholder/guang-2025.svg',
    title: '高考倒计时', date: '2025.06.05', place: '教室',
    desc: '黑板上写着：距离高考 365 天。',
    participants: ['全班同学'], uploader: '陈一凡'
  },
  {
    id: 'm-10', type: 'image', category: 'other',
    src: 'assets/images/placeholder/yuan-2026.svg',
    thumb: 'assets/images/placeholder/yuan-2026.svg',
    title: '行囊', date: '2026.08.10', place: '各自的车站',
    desc: '后来，我们都打包好了各自的远方。',
    participants: ['全班同学'], uploader: '何梦瑶'
  }
];
