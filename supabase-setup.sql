-- ============================================================
-- 2023级7班 · 毕业纪念馆 — Supabase 初始化脚本
-- 用法：Supabase 控制台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 安全模型：
--   · 同学数据：匿名可读，登录用户可编辑（班级共享编辑）
--   · 信件数据：表本身不开放直接读取，全部经由两个函数
--       list_letters()    → 公开的收信人/写信人/日期
--       open_letter(id, pw) → 密码正确才返回正文，连续错 5 次锁 10 分钟
--   · 留言：匿名可读，登录用户可发
--   · 管理员（admins 表）：可增删改信件
-- ============================================================

-- 扩展（SHA-256 哈希）
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 表
-- ------------------------------------------------------------

-- 同学（整条 JSON 存取，字段自由）
create table if not exists public.classmates (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- 信件（正文 Base64 存库，哈希服务端校验）
create table if not exists public.letters (
  id text primary key,
  recipient text not null,
  sender text not null default '',
  letter_date text not null default '',
  password_hash text not null,
  body_b64 text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- 留言板
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  author text not null,
  content text not null,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- 管理员名单（在此添加管理员 user_id）
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 自动维护 updated_at
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists classmates_touch on public.classmates;
create trigger classmates_touch before update on public.classmates
  for each row execute function public.touch_updated_at();

drop trigger if exists letters_touch on public.letters;
create trigger letters_touch before update on public.letters
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 行级安全（RLS）
-- ------------------------------------------------------------
alter table public.classmates enable row level security;
alter table public.letters enable row level security;
alter table public.messages enable row level security;
alter table public.admins enable row level security;

-- 同学：匿名读，登录可增删改（班级共享编辑）
drop policy if exists classmates_public_read on public.classmates;
create policy classmates_public_read on public.classmates
  for select using (true);
drop policy if exists classmates_auth_write on public.classmates;
create policy classmates_auth_write on public.classmates
  for all to authenticated using (true) with check (true);

-- 信件：表本身不开放（匿名与登录用户都不能直接 SELECT）
drop policy if exists letters_no_direct_read on public.letters;
create policy letters_no_direct_read on public.letters
  for select using (false);
-- 管理员可写信件
drop policy if exists letters_admin_write on public.letters;
create policy letters_admin_write on public.letters
  for all to authenticated
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

-- 留言：匿名读，登录可发
drop policy if exists messages_public_read on public.messages;
create policy messages_public_read on public.messages
  for select using (true);
drop policy if exists messages_auth_insert on public.messages;
create policy messages_auth_insert on public.messages
  for insert to authenticated with check (true);

-- 管理员表：仅本人可见自己的记录
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------
-- 函数：管理员取信件全文（含哈希/正文；仅 admins 表内用户可调）
-- ------------------------------------------------------------
create or replace function public.admin_get_letter(p_id text)
returns table(id text, recipient text, sender text, letter_date text, password_hash text, body_b64 text)
language sql security definer stable
set search_path = public as $$
  select id, recipient, sender, letter_date, password_hash, body_b64
  from public.letters
  where id = p_id
    and exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.admin_get_letter(text) to authenticated;

-- ------------------------------------------------------------
-- 函数：信件列表（公开的安全字段）
-- ------------------------------------------------------------
create or replace function public.list_letters()
returns table(id text, recipient text, sender text, letter_date text)
language sql security definer stable
set search_path = public as $$
  select id, recipient, sender, letter_date
  from public.letters
  order by letter_date desc nulls last;
$$;

-- ------------------------------------------------------------
-- 函数：开启信件（服务端校验密码，连续错 5 次锁 10 分钟）
-- ------------------------------------------------------------
create or replace function public.open_letter(p_id text, p_password text)
returns table(recipient text, sender text, letter_date text, body text)
language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_row public.letters%rowtype;
begin
  select * into v_row from public.letters where id = p_id;
  if not found then
    raise exception 'LETTER_NOT_FOUND';
  end if;
  if v_row.locked_until is not null and v_row.locked_until > now() then
    raise exception 'LETTER_LOCKED';
  end if;

  if v_row.password_hash = encode(digest(p_password, 'sha256'), 'hex') then
    update public.letters
      set failed_attempts = 0, locked_until = null
      where id = p_id;
    return query select v_row.recipient, v_row.sender, v_row.letter_date,
      convert_from(decode(v_row.body_b64, 'base64'), 'UTF8');
  else
    update public.letters
      set failed_attempts = failed_attempts + 1,
          locked_until = case
            when failed_attempts + 1 >= 5 then now() + interval '10 minutes'
            else locked_until
          end
      where id = p_id;
    raise exception 'WRONG_PASSWORD';
  end if;
end $$;

-- 函数执行权限（security definer，匿名与登录用户均可调用）
grant execute on function public.list_letters() to anon, authenticated;
grant execute on function public.open_letter(text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 可选：迁移本地模拟数据（12 位同学 + 3 封信）
-- 如果希望从空数据开始，删掉本段即可
-- ------------------------------------------------------------
insert into public.classmates (id, data) values ('chenyifan', '{"id": "chenyifan", "name": "陈一凡", "gender": "男", "city": "北京", "province": "北京", "coords": [116.4, 39.9], "university": "清华大学", "major": "计算机科学与技术", "quote": "写代码和写诗，都想试试。", "tags": ["班长", "数竞"], "color": "#7E94A8", "contact": {"wechat": "chenyifan_2026", "qq": "285731946", "email": "chenyifan2026@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('linxiaoyu', '{"id": "linxiaoyu", "name": "林晓雨", "gender": "女", "city": "北京", "province": "北京", "coords": [116.4, 39.9], "university": "北京大学", "major": "法学", "quote": "想做一个替人说话的人。", "tags": ["辩论队", "文笔好"], "color": "#B08A96", "contact": {"wechat": "linxiaoyu_law", "qq": "394827156", "email": "linxiaoyu@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('wangzihao', '{"id": "wangzihao", "name": "王子豪", "gender": "男", "city": "北京", "province": "北京", "coords": [116.4, 39.9], "university": "北京航空航天大学", "major": "软件工程", "quote": "天空和代码，总得征服一个。", "tags": ["航模社"], "color": "#8FA68F", "contact": {"wechat": "zihao_wh", "qq": "582913647", "email": "wangzihao@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('suwanqing', '{"id": "suwanqing", "name": "苏婉晴", "gender": "女", "city": "上海", "province": "上海", "coords": [121.47, 31.23], "university": "复旦大学", "major": "新闻学", "quote": "把世界写给你看。", "tags": ["校刊主编", "文艺"], "color": "#9B8FA8", "contact": {"wechat": "suwanqing_fd", "qq": "473629185", "email": "suwanqing@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('zhaomingxuan', '{"id": "zhaomingxuan", "name": "赵明轩", "gender": "男", "city": "上海", "province": "上海", "coords": [121.47, 31.23], "university": "上海交通大学", "major": "电子信息", "quote": "实验室常驻人口。", "tags": ["物理课代表"], "color": "#A99078", "contact": {"wechat": "mingxuan_z", "qq": "916384527", "email": "zhaomingxuan@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('zhouruotong', '{"id": "zhouruotong", "name": "周若彤", "gender": "女", "city": "成都", "province": "四川", "coords": [104.07, 30.67], "university": "四川大学", "major": "口腔医学", "quote": "笑起来才好看。", "tags": ["文艺委员", "手账"], "color": "#A8816E", "contact": {"wechat": "ruotong_zz", "qq": "628495731", "email": "zhouruotong@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('wukaiwen', '{"id": "wukaiwen", "name": "吴凯文", "gender": "男", "city": "成都", "province": "四川", "coords": [104.07, 30.67], "university": "电子科技大学", "major": "通信工程", "quote": "信号满格。", "tags": ["篮球", "电音"], "color": "#7E9A96", "contact": {"wechat": "kaiwen_wu", "qq": "749183625", "email": "wukaiwen@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('zhengyating', '{"id": "zhengyating", "name": "郑雅婷", "gender": "女", "city": "武汉", "province": "湖北", "coords": [114.3, 30.59], "university": "武汉大学", "major": "测绘工程", "quote": "画地图的人，不怕迷路。", "tags": ["地理课代表"], "color": "#8A97A6", "contact": {"wechat": "yating_map", "qq": "315926478", "email": "zhengyating@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('sunhaoran', '{"id": "sunhaoran", "name": "孙浩然", "gender": "男", "city": "武汉", "province": "湖北", "coords": [114.3, 30.59], "university": "华中科技大学", "major": "机械工程", "quote": "动手比动嘴快。", "tags": ["机器人社"], "color": "#A6936F", "contact": {"wechat": "haoran_s", "qq": "864721935", "email": "sunhaoran@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('gaoshihan', '{"id": "gaoshihan", "name": "高诗涵", "gender": "女", "city": "西安", "province": "陕西", "coords": [108.94, 34.34], "university": "西安交通大学", "major": "电气工程", "quote": "长安城的电，我来管。", "tags": ["古筝", "数学课代表"], "color": "#8F7E9E", "contact": {"wechat": "shihan_gao", "qq": "527394816", "email": "gaoshihan@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('liujunjie', '{"id": "liujunjie", "name": "刘俊杰", "gender": "男", "city": "杭州", "province": "浙江", "coords": [120.15, 30.28], "university": "浙江大学", "major": "生物科学", "quote": "西湖边的实验室。", "tags": ["生物竞赛"], "color": "#6F8F8A", "contact": {"wechat": "junjie_liu", "qq": "136827549", "email": "liujunjie@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.classmates (id, data) values ('hemengyao', '{"id": "hemengyao", "name": "何梦瑶", "gender": "女", "city": "广州", "province": "广东", "coords": [113.26, 23.13], "university": "中山大学", "major": "临床医学", "quote": "想成为能被依赖的人。", "tags": ["志愿者", "英语课代表"], "color": "#A08B7E", "contact": {"wechat": "mengyao_he", "qq": "483917265", "email": "hemengyao@example.com"}}'::jsonb) on conflict (id) do nothing;
insert into public.letters (id, recipient, sender, letter_date, password_hash, body_b64) values ('suwanqing', '苏婉晴', '陈一凡', '2026.06.09', '6633b9572f58bbcd9ef27958f898b0c1e0138e61d79aa7d73281fa0686c450c7', '5YaZ6L+Z5bCB5L+h55qE5pe25YCZ77yM5q+V5Lia5YW456S85Yia5Yia5pWj5Zy644CC56S85aCC55qE54Gv5LiA55uP5LiA55uP54Gt5o6J77yM5oiR56uZ5Zyo6Zeo5Y+j77yM56qB54S25b6I5oOz5ZKM5L2g6K+054K55LuA5LmI44CCCgrpq5jkuIDpgqPlubTvvIzkvaDlnKjmoKHliIrkuIrlhpnnmoTnrKzkuIDnr4fnqL/lrZDvvIzmiJHorrDlvpfmoIfpopjmmK/jgIrkuIPnj63nmoTnp4vlpKnjgIvjgILkvaDlhpnnqpflpJbnmoTpk7bmnY/vvIzlhpnmiJHku6zmr4/kuKrkurrnmoTlkI3lrZfjgILpgqPmmK/miJHnrKzkuIDmrKHop4nlvpfvvIzljp/mnaXmloflrZflj6/ku6Xov5nkuYjmuKnmn5TjgIIKCuWQjuadpeS4ieW5tO+8jOS9oOS4gOebtOaYr+mCo+S4quaKiuWkp+WutuWGmei/m+aVheS6i+mHjOeahOS6uuOAgui/kOWKqOS8muOAgeWQiOWUseavlOi1m+OAgeavj+S4gOasoeePreS8mu+8jOS9oOeahOeslOiusOacrOS4iuiusOa7oeS6huWIq+S6uu+8jOWNtOW+iOWwkeWGmeiHquW3seOAggoK5omA5Lul6L+Z5bCB5L+h77yM5oiR5Lus5oOz6L+Y57uZ5L2g5LiA5Liq5L2N572u44CCCgrlqYnmmbTvvIzljrvkuIrmtbfku6XlkI7vvIzkuZ/opoHnu6fnu63lhpnkuIvljrvjgILmiorlpI3ml6bnmoTmoqfmoZDlhpnkuIvmnaXvvIzmiormlrDmnIvlj4vlhpnkuIvmnaXjgILnrYnlvojlpJrlubTlkI7miJHku6zph43pgKLvvIzkvaDkuIDlrprkvJrluKbnnYDljprljprkuIDlj6DmlYXkuovjgIIKCuWIsOmCo+aXtuWAme+8jOWIq+W/mOS6huaKiuaIkeS7rOS5n+WGmei/m+WOu+OAgg==') on conflict (id) do nothing;
insert into public.letters (id, recipient, sender, letter_date, password_hash, body_b64) values ('chenyifan', '陈一凡', '林晓雨', '2026.06.10', '6d5ad2e08d2197a055b4ea2ed41742a662c1252a633e2416a40ea1f64fcc6f14', '54+t6ZW/77yM6L+Z5bCB5L+h5YW25a6e54q56LGr5LqG5b6I5LmF5omN5YaZ44CC5pyJ5Lqb6K+d5b2T6Z2i6K+05LiN5Ye65Y+j77yM6ZqU552A57q45Y+N6ICM5a655piT5LiA54K544CCCgrosKLosKLkvaDov5nkuInlubTvvIzmgLvmmK/nrKzkuIDkuKrliLDmlZnlrqTvvIzmnIDlkI7kuIDkuKrotbDjgILov5DliqjkvJrmiqXlkI3lh5HkuI3pvZDkurrnmoTml7blgJnmmK/kvaDvvIzlpKfmiavpmaTmsqHkurrmhL/mhI/mk6bnqpfmiLfnmoTml7blgJnkuZ/mmK/kvaDjgILkvaDmgLvor7Toh6rlt7HmmK8i5bel5YW35Lq6Iu+8jOS9huaIkeS7rOmDveefpemBk++8jOS4g+ePreaYr+WboOS4uuS9oOaJjeayoeacieaVo+i/h+OAggoK6auY6ICD5YmN5pyA5ZCO5LiA5Liq5pma6Ieq5Lmg77yM5L2g5Zyo6buR5p2/5LiK5YaZIuelneaIkeS7rOmDveWOu+aDs+WOu+eahOWcsOaWuSLjgILlvZPml7blpKflrrbpg73lnKjnrJHvvIzlhbblrp7lpb3lh6DkuKrkurrlgbflgbfnuqLkuobnnLznnZvjgIIKCuS4gOWHoe+8jOWOu+a4heWNjuS7peWQju+8jOWIq+WGjeaKiuaJgOacieS6i+mDveaPveWcqOiHquW3sei6q+S4iuOAguWBtuWwlOS5n+m6u+eDpuS4gOS4i+WIq+S6uu+8jOWwseWDj+S9oOWFgeiuuOaIkeS7rOm6u+eDpuS9oOmCo+agt+OAggoKCuS6m+acie+8jOS9oOeahOivl+WGmeW+luecn+eahOW+iOWlve+8jOWIq+WBnOOAgg==') on conflict (id) do nothing;
insert into public.letters (id, recipient, sender, letter_date, password_hash, body_b64) values ('linxiaoyu', '林晓雨', '苏婉晴', '2026.06.11', 'a1a6c502067edf5192ef7b527aa574565beddff025cd76ca081a528a53dd68b1', '5pmT6Zuo77yM5ZCs6K+05L2g6YCJ5LqG5rOV5a2m77yM5oiR5LiA54K56YO95LiN5oSP5aSW44CC6auY5LiA6L6p6K666LWb55qE5pe25YCZ77yM5L2g5LiA5Liq5Lq65oqK5a+55pa55Zub6L6p6K+05b6X5ZOR5Y+j5peg6KiA77yM6YKj5pe25YCZ5oiR5bCx5oOz77yM6L+Z5Liq5aWz55Sf5Lul5ZCO5LiA5a6a5Lya5pu/5b6I5aSa5Lq66K+06K+d44CCCgrkvaDmgLvor7Toh6rlt7HlmLTnrKjvvIzkuI3kvJrlronmhbDkurrjgILlj6/mmK/pq5jkuInpgqPlubTmiJHlk63nmoTml7blgJnvvIzkvaDku4DkuYjpg73msqHor7TvvIzlj6rmmK/lvoDmiJHmir3lsYnph4zloZ7kuobkuIDljIXnurjlt77lkozkuIDlvKDnurjmnaHvvIzlhpnnnYAi5rKh5LqL77yM5oiR5ZyoIuOAggoK6YKj5byg57q45p2h5oiR6L+Y55WZ552A77yM5aS55Zyo5qCh5YiK55qE5pyA5ZCO5LiA6aG144CCCgrljrvljJfkuqzku6XlkI7vvIzlhqzlpKnorrDlvpfnqb/ljprkuIDngrnjgILljJfmlrnnmoTpo47lkozlrrbph4zkuI3kuIDmoLfvvIzkvYbkvaDkvJrkuaDmg6/nmoTvvIzlsLHlg4/miJHku6zkuaDmg6/kuobkuInlubTmnInkvaDnmoTmlZnlrqTjgIIKCuWmguaenOWTquWkqeS9oOaDs+WutuS6hu+8jOWwsee7meaIkeaJk+eUteivneOAguWPt+eggeS4jeS8muWPmOOAgg==') on conflict (id) do nothing;

select 'setup complete' as status;