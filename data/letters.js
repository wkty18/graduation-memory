/* ============================================
   信件数据 · 密码信件「写给你」
   ------------------------------------------------------------
   【安全性说明】这是「前端访问限制」，不是真正的安全系统：
   - 密码以 SHA-256 哈希存储，不出现明文
   - 信件正文以 Base64 编码，避免顺手翻源码时直接读到
   - 但任何能打开浏览器开发者工具的人，理论上都能解开这些内容
   - 若未来需要真正的隐私保护，请迁移到后端方案
     （如 Supabase / Cloudflare Workers / 自建服务），
     前端仅保留解密后的展示逻辑
   ============================================================ */
window.GM_DATA = window.GM_DATA || {};

window.GM_DATA.letters = [
  {
    id: 'suwanqing',
    to: '苏婉晴',
    from: '陈一凡',
    date: '2026.06.09',
    passwordHash: '6633b9572f58bbcd9ef27958f898b0c1e0138e61d79aa7d73281fa0686c450c7',
    bodyB64: '5YaZ6L+Z5bCB5L+h55qE5pe25YCZ77yM5q+V5Lia5YW456S85Yia5Yia5pWj5Zy644CC56S85aCC55qE54Gv5LiA55uP5LiA55uP54Gt5o6J77yM5oiR56uZ5Zyo6Zeo5Y+j77yM56qB54S25b6I5oOz5ZKM5L2g6K+054K55LuA5LmI44CCCgrpq5jkuIDpgqPlubTvvIzkvaDlnKjmoKHliIrkuIrlhpnnmoTnrKzkuIDnr4fnqL/lrZDvvIzmiJHorrDlvpfmoIfpopjmmK/jgIrkuIPnj63nmoTnp4vlpKnjgIvjgILkvaDlhpnnqpflpJbnmoTpk7bmnY/vvIzlhpnmiJHku6zmr4/kuKrkurrnmoTlkI3lrZfjgILpgqPmmK/miJHnrKzkuIDmrKHop4nlvpfvvIzljp/mnaXmloflrZflj6/ku6Xov5nkuYjmuKnmn5TjgIIKCuWQjuadpeS4ieW5tO+8jOS9oOS4gOebtOaYr+mCo+S4quaKiuWkp+WutuWGmei/m+aVheS6i+mHjOeahOS6uuOAgui/kOWKqOS8muOAgeWQiOWUseavlOi1m+OAgeavj+S4gOasoeePreS8mu+8jOS9oOeahOeslOiusOacrOS4iuiusOa7oeS6huWIq+S6uu+8jOWNtOW+iOWwkeWGmeiHquW3seOAggoK5omA5Lul6L+Z5bCB5L+h77yM5oiR5Lus5oOz6L+Y57uZ5L2g5LiA5Liq5L2N572u44CCCgrlqYnmmbTvvIzljrvkuIrmtbfku6XlkI7vvIzkuZ/opoHnu6fnu63lhpnkuIvljrvjgILmiorlpI3ml6bnmoTmoqfmoZDlhpnkuIvmnaXvvIzmiormlrDmnIvlj4vlhpnkuIvmnaXjgILnrYnlvojlpJrlubTlkI7miJHku6zph43pgKLvvIzkvaDkuIDlrprkvJrluKbnnYDljprljprkuIDlj6DmlYXkuovjgIIKCuWIsOmCo+aXtuWAme+8jOWIq+W/mOS6huaKiuaIkeS7rOS5n+WGmei/m+WOu+OAgg=='
  },
  {
    id: 'chenyifan',
    to: '陈一凡',
    from: '林晓雨',
    date: '2026.06.10',
    passwordHash: '6d5ad2e08d2197a055b4ea2ed41742a662c1252a633e2416a40ea1f64fcc6f14',
    bodyB64: '54+t6ZW/77yM6L+Z5bCB5L+h5YW25a6e54q56LGr5LqG5b6I5LmF5omN5YaZ44CC5pyJ5Lqb6K+d5b2T6Z2i6K+05LiN5Ye65Y+j77yM6ZqU552A57q45Y+N6ICM5a655piT5LiA54K544CCCgrosKLosKLkvaDov5nkuInlubTvvIzmgLvmmK/nrKzkuIDkuKrliLDmlZnlrqTvvIzmnIDlkI7kuIDkuKrotbDjgILov5DliqjkvJrmiqXlkI3lh5HkuI3pvZDkurrnmoTml7blgJnmmK/kvaDvvIzlpKfmiavpmaTmsqHkurrmhL/mhI/mk6bnqpfmiLfnmoTml7blgJnkuZ/mmK/kvaDjgILkvaDmgLvor7Toh6rlt7HmmK8i5bel5YW35Lq6Iu+8jOS9huaIkeS7rOmDveefpemBk++8jOS4g+ePreaYr+WboOS4uuS9oOaJjeayoeacieaVo+i/h+OAggoK6auY6ICD5YmN5pyA5ZCO5LiA5Liq5pma6Ieq5Lmg77yM5L2g5Zyo6buR5p2/5LiK5YaZIuelneaIkeS7rOmDveWOu+aDs+WOu+eahOWcsOaWuSLjgILlvZPml7blpKflrrbpg73lnKjnrJHvvIzlhbblrp7lpb3lh6DkuKrkurrlgbflgbfnuqLkuobnnLznnZvjgIIKCuS4gOWHoe+8jOWOu+a4heWNjuS7peWQju+8jOWIq+WGjeaKiuaJgOacieS6i+mDveaPveWcqOiHquW3sei6q+S4iuOAguWBtuWwlOS5n+m6u+eDpuS4gOS4i+WIq+S6uu+8jOWwseWDj+S9oOWFgeiuuOaIkeS7rOm6u+eDpuS9oOmCo+agt+OAggoKCuS6m+acie+8jOS9oOeahOivl+WGmeW+luecn+eahOW+iOWlve+8jOWIq+WBnOOAgg=='
  },
  {
    id: 'linxiaoyu',
    to: '林晓雨',
    from: '苏婉晴',
    date: '2026.06.11',
    passwordHash: 'a1a6c502067edf5192ef7b527aa574565beddff025cd76ca081a528a53dd68b1',
    bodyB64: '5pmT6Zuo77yM5ZCs6K+05L2g6YCJ5LqG5rOV5a2m77yM5oiR5LiA54K56YO95LiN5oSP5aSW44CC6auY5LiA6L6p6K666LWb55qE5pe25YCZ77yM5L2g5LiA5Liq5Lq65oqK5a+55pa55Zub6L6p6K+05b6X5ZOR5Y+j5peg6KiA77yM6YKj5pe25YCZ5oiR5bCx5oOz77yM6L+Z5Liq5aWz55Sf5Lul5ZCO5LiA5a6a5Lya5pu/5b6I5aSa5Lq66K+06K+d44CCCgrkvaDmgLvor7Toh6rlt7HlmLTnrKjvvIzkuI3kvJrlronmhbDkurrjgILlj6/mmK/pq5jkuInpgqPlubTmiJHlk63nmoTml7blgJnvvIzkvaDku4DkuYjpg73msqHor7TvvIzlj6rmmK/lvoDmiJHmir3lsYnph4zloZ7kuobkuIDljIXnurjlt77lkozkuIDlvKDnurjmnaHvvIzlhpnnnYAi5rKh5LqL77yM5oiR5ZyoIuOAggoK6YKj5byg57q45p2h5oiR6L+Y55WZ552A77yM5aS55Zyo5qCh5YiK55qE5pyA5ZCO5LiA6aG144CCCgrljrvljJfkuqzku6XlkI7vvIzlhqzlpKnorrDlvpfnqb/ljprkuIDngrnjgILljJfmlrnnmoTpo47lkozlrrbph4zkuI3kuIDmoLfvvIzkvYbkvaDkvJrkuaDmg6/nmoTvvIzlsLHlg4/miJHku6zkuaDmg6/kuobkuInlubTmnInkvaDnmoTmlZnlrqTjgIIKCuWmguaenOWTquWkqeS9oOaDs+WutuS6hu+8jOWwsee7meaIkeaJk+eUteivneOAguWPt+eggeS4jeS8muWPmOOAgg=='
  }
];
