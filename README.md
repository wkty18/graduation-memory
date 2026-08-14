# 2023级7班 · 毕业纪念馆

> 我们曾在同一个教室里相遇，后来奔向不同的远方。

一座属于 2023级7班所有人的线上毕业纪念馆：照片、视频、音乐、地图、密码信件，都保存在这里，很多年后依然可以打开。

## 技术栈

- 纯原生 HTML / CSS / JavaScript，**零依赖、零构建**
- Hash 路由 SPA（页面切换不刷新，GitHub Pages 刷新不 404）
- 深浅色主题（LocalStorage 持久化）、响应式（重点优化手机端）
- 数据与页面完全分离：`data/` 目录修改即可增删内容

## 项目结构

```text
毕业纪念馆/
├── index.html             入口（直接双击即可运行）
├── README.md
├── css/
│   ├── tokens.css         设计变量（颜色/字体/深浅色主题）
│   ├── base.css           基础样式
│   ├── components.css     导航/Lightbox/音乐按钮等组件
│   └── pages.css          各页面样式
├── js/
│   ├── app.js             入口
│   ├── router.js          hash 路由
│   ├── theme.js           主题管理
│   ├── intro.js           开屏动画
│   ├── utils.js           工具函数
│   ├── components/        导航/toast/Lightbox/数字滚动/音乐
│   └── pages/             首页/地图/相册/信件/成员/时间线/关于/设置
├── data/
│   ├── classmates.js      同学信息
│   ├── albums.js          相册条目与分类
│   ├── timeline.js        时间线
│   ├── letters.js         密码信件
│   ├── map.js             投影范围/城市连接线
│   ├── china.js           省界数据（来源：国家地理信息公共服务平台）
│   └── cities.js          城市坐标库（地点自动识别用）
├── build-map-data.py      省界数据构建脚本（GeoJSON → china.js）
└── assets/
    ├── archive/graduation-2026/  毕业演讲原版网页 + 全部素材（原样保存）
    ├── images/placeholder/       程序生成的占位图
    └── （压缩图片脚本 compress-images.ps1）
```

## 如何运行

**无需安装任何东西。**

- 本地：双击 `index.html`，或在终端 `start index.html`
- 线上：部署到 GitHub Pages（见下文）

> 提示：`file://` 下所有功能均可正常使用（包括信件密码校验）。

## 如何添加同学

**方式一：管理员控制台（推荐，带地图选点）**

进入隐蔽管理员入口（页脚标语连点 5 次，或访问 `#/admin`），在「同学管理」里：
- 点「＋ 新增同学」，填写信息——**输入城市名后自动识别位置并标记在地图上**（内置约 250 座中国主要城市的坐标库，离线可用；支持「大理」→大理白族自治州 这类简称匹配）
- 本地库未收录的城市：可在地图上直接点击标记，或点「联网识别」（免费地理编码服务，需联网）
- 手动点图优先于自动识别；城市与现有城市同名时会自动聚合
- 「自动识别未标记位置」：一键为所有只有城市名、没有坐标的同学批量补上位置
- 编辑保存在本浏览器；点「导出 classmates.js」下载文件，替换 `data/` 下同名文件后，修改对所有人永久生效
- 「撤销全部本地修改」可放弃未导出的编辑
- 想扩充城市库：编辑 `data/cities.js`，照 `['名称', 经度, 纬度, '省级']` 格式加一行即可

**方式二：直接编辑数据文件**

编辑 `data/classmates.js`，在数组里加一条：

```js
{
  id: 'zhangsan',              // 唯一英文 id，用于个人页地址 #/classmates/zhangsan
  name: '张三',
  gender: '男',
  city: '北京',                 // 地图按城市自动聚合
  province: '北京',
  coords: [116.40, 39.90],      // 城市经纬度（地图上点的位置）
  university: 'XX大学',
  major: 'XX专业',
  quote: '一句话介绍自己',
  tags: ['标签1', '标签2'],
  color: '#7E94A8',             // 头像底色（姓氏首字自动生成头像）
  contact: {                    // 联系方式（选填）
    wechat: 'zhangsan_wx',
    qq: '123456789',
    email: 'zhangsan@example.com'
  }
}
```

> **联系方式展示规则**：TA 有密码信时，联系方式藏在信里（打开信后可见）；没有信时，个人页提供「点击查看联系方式」。可在管理员控制台的编辑器里直接填写这三个字段。

首页统计、地图节点、人物墙、个人页会全部自动更新。

## 如何添加照片 / 视频 / 音频

1. 把文件放进 `assets/` 下（建议按类别建子文件夹，如 `assets/images/`）
2. 编辑 `data/albums.js`，添加条目：

```js
{
  id: 'new-01',                 // 唯一 id
  type: 'image',                // image | video | audio | iframe
  category: 'graduation',       // grade1/grade2/grade3/activity/daily/graduation/other
  src: 'assets/images/xxx.jpg', // 原图（Lightbox 里显示）
  thumb: 'assets/images/xxx_thumb.jpg', // 缩略图（瀑布流用，可省略则用 src）
  title: '照片标题',
  date: '2026.06.05', place: '拍摄地点',
  desc: '一句话描述',
  participants: ['张三', '李四'], // 参与同学（或 ['全班同学']）
  uploader: '张三'
}
```

**图片压缩**：大图（>1.5MB 或 >1920px）会自动建议压缩。可用附带脚本批量处理：

```powershell
powershell -ExecutionPolicy Bypass -File compress-images.ps1
```

（脚本会为 `assets/archive/graduation-2026/` 内的图片生成缩略图并压缩大图；处理其他目录请修改脚本内 `$dir`）

**视频**：`type: 'video'`，建议 `poster` 字段填一张缩略图。浏览器只会在 Lightbox 打开时加载视频。

## 如何添加信件 / 修改密码

**方式一：管理员控制台（推荐）**

在「信件管理」里：
- 点「＋ 新增信件」，选收信人（已有信的会标注且不可重复），填写信人/日期，**直接输入明文密码**，写下正文
- 密码在浏览器内即时转为 SHA-256 哈希保存，明文不落盘；编辑时密码留空则保持原密码
- 点「导出 letters.js」下载文件，替换 `data/` 下同名文件后对所有人永久生效

**方式二：直接编辑数据文件**

编辑 `data/letters.js`：

1. 生成新密码的 SHA-256 哈希：

```bash
printf '%s' "你的密码" | sha256sum
```

   或打开任意在线 SHA-256 工具（注意选 UTF-8 编码）。

2. 生成正文的 Base64 编码（UTF-8）：

```bash
printf '%s' "信件正文……" | base64 -w0
```

3. 添加条目：

```js
{
  id: 'zhangsan',               // 与 classmates.js 中 id 对应
  to: '张三',
  from: '李四',
  date: '2026.06.10',
  passwordHash: '上面算出的哈希',
  bodyB64: '上面算出的 Base64'
}
```

信件页会自动出现新信封；收信人在个人页也会看到「写给他的信」入口。

### ⚠️ 安全说明（请务必了解）

这是**前端访问限制，不是真正的安全系统**：

- 密码以 SHA-256 哈希存储，正文以 Base64 编码 —— 能挡住「顺手翻源码」的人
- 但任何打开浏览器开发者工具的人，理论上都能解出信件内容
- 若信件涉及真正敏感的隐私，请迁移到后端方案（Supabase / Firebase / Cloudflare Workers / 自建服务），前端信纸与解锁流程可直接复用

## 如何修改地图数据

- **城市位置**：改 `data/classmates.js` 里同学的 `coords`，地图节点自动跟随
- **城市连接线**：编辑 `data/map.js` 的 `connections`，按城市名配对
- **省界底图**：数据在 `data/china.js`，**来源：国家地理信息公共服务平台**
  - 如需更新省界数据：把新的省界 GeoJSON 放到本地，修改 `build-map-data.py` 顶部的 `SRC` 路径，然后运行：
    ```bash
    python build-map-data.py
    ```
  - 脚本会自动做 Douglas-Peucker 简化（容差 0.025°）、过滤南海诸岛与微小岛屿、保留全部 34 个省级行政区（含港澳台）
  - 地图投影为等距圆柱 + 纬度余弦校正（示意用途，非测绘精确）

## 如何换背景音乐

编辑 `js/components/music.js` 里的 `tracks`：

```js
tracks: [
  { id: 'new-song', src: 'assets/audio/新曲子.mp3', title: '曲子名称' },
]
```

- 把音乐文件放进 `assets/` 下即可；默认关闭，用户点击右上角音符按钮才播放（符合浏览器自动播放策略）
- 换好后记得把设置页的提示文案一并更新

## 彩蛋

- 首页 Hero 里连点「7」七次 —— 会有回应

## 管理员入口（隐蔽）

- 在页脚「我们曾经是 2023级7班。」上**连点 5 次**，或直接访问 `#/admin`
- 口令校验为 SHA-256 哈希（前端访问限制，非服务器级安全；与信件系统同级）
- 控制台功能：数据总览 / 同学管理（增删改 + 地图标记位置 + 导出 classmates.js）/ 信件管理（增删改 + 设置密码 + 导出 letters.js）/ 快捷操作 / 环境信息
- 口令如需更换：用 `printf '%s' "新口令" | sha256sum` 算出哈希，替换 `js/pages/admin.js` 中的 `PASSWORD_HASH`

## Supabase 云端部署（可选 · 让所有人共享编辑）

启用后：同学/信件/留言存云端，**登录用户直接在网站上编辑**（所有人实时可见），信件密码由服务端校验（连续错 5 次锁 10 分钟），新增「留言板」页面。

**1. 注册建项目**：supabase.com 注册 → 新建项目（地区选 Singapore 或 Tokyo）→ 记住数据库密码。

**2. 建表**：项目控制台 → **SQL Editor** → 粘贴 `supabase-setup.sql` 全部内容 → Run。
（脚本含建表、权限策略、密码校验函数，并预置了本地模拟的 12 位同学与 3 封信；不想要模拟数据删掉脚本末尾的迁移段即可。）

**3. 开启邮箱登录**：Authentication → Sign In / Providers → 打开 **Email**。
（测试期建议把 "Confirm email" 关掉，免得注册要收邮件。）

**4. 创建管理员账号**：Authentication → Users → **Add user** 填入邮箱密码（勾选 Auto Confirm）→ 复制该用户的 **UID** → 回到 SQL Editor 执行：
```sql
insert into public.admins (user_id) values ('粘贴-UID');
```

**5. 填入站点配置**：编辑 `js/config.js`：
```js
window.GM_CONFIG = {
  supabaseUrl: 'https://你的项目.supabase.co',
  supabaseAnonKey: 'anon public 密钥（Project Settings → API 里复制）'
};
```

**6. 部署**：按下方 GitHub Pages 步骤发布即可。

**使用说明（谁可以在线改什么）**：
- **所有人**（未登录）：浏览全站、打开密码信（密码正确时）
- **班级成员**（注册并登录后）：在「我们」页点「＋ 添加 / 编辑同学名单」（或页脚连点 5 次进控制台）编辑同学；在「留言」页留言——**保存即写入云端，所有人立刻可见**
- **管理员**（admins 表内账号）：以上全部 + 信件管理（编辑/设密码/删除）+ 快捷操作
- 控制台口令（页脚连点 5 次）是本地模式与离线时的备用入口；云端登录用户免口令
- 云端模式下「撤销本地修改」按钮自动隐藏，数据以云端为准
- 本地模式（不配 config）全部功能照旧，适合无后端场景

## 如何部署 GitHub Pages

1. 把整个 `毕业纪念馆/` 文件夹推送到 GitHub 仓库
2. 仓库 `Settings → Pages → Source` 选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`（若文件夹在子目录，选对应目录）
3. 等待构建完成，访问 `https://用户名.github.io/仓库名/`

本项目使用 **hash 路由 + 相对路径**：

- 刷新任意页面不会 404
- 部署在子目录（如 `username.github.io/repo/`）也无需任何配置

## 常见问题

- **照片不显示**：检查 `data/albums.js` 里的路径，是否以 `assets/` 开头且大小写一致
- **音乐没声音**：浏览器策略要求用户先与页面交互（点击按钮），本项目已默认关闭自动播放
- **想改年份**：全局搜索 `2023` / `2026`，主要在 `data/`、首页与页脚文案里
