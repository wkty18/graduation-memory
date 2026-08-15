/* ============================================
   关于页 · 关于 2023级7班
   ============================================ */
GM.pages = GM.pages || {};

GM.pages.about = {
  render() {
    return `
    <div class="page about-page">
      <div class="page-head">
        <div class="eyebrow">关于</div>
        <h1>关于 2023级7班</h1>
        <p class="subtitle">一座属于我们所有人的线上毕业纪念馆</p>
      </div>
      <div class="container container--narrow">
        <section class="about-sec reveal">
          <h2>我们的班</h2>
          <p>2023 年秋天，十几个名字被写进同一张分班表。2026 年夏天，同一批名字出现在不同的录取通知书上。</p>
          <p>三年里，我们一起熬过晚自习，抢过食堂的糖醋里脊，在运动会的看台上喊哑过嗓子，也在一张张卷子之间，慢慢长成了大人。</p>
          <p class="about-em">我们曾在同一个教室里相遇，后来奔向不同的远方。</p>
        </section>

        <section class="about-sec reveal" data-delay="1">
          <h2>这个网站</h2>
          <p>这是一座「毕业纪念馆」：照片、视频、音乐、地图、信件，都保存在这里，很多年后依然可以打开。</p>
          <ul class="about-list">
            <li>首页 · 仪式感与数字，记录我们散落的样子</li>
            <li>地图 · 七个城市，每一颗亮起的点都是一位同学</li>
            <li>相册 · 按年份与主题归档，含毕业演讲全部素材</li>
            <li>信件 · 密码信，有些话只想写给某一个人</li>
            <li>时间线 · 2023 到 2026，我们一起走过的日子</li>
          </ul>
        </section>

        <section class="about-sec reveal" data-delay="2">
          <h2>数据与隐私</h2>
          <p>信件密码采用「前端访问限制」：密码以 SHA-256 哈希存储，正文以 Base64 编码。它能挡住随手翻源码的人，但不是服务器级安全。</p>
          <p>如果你希望信件拥有真正的隐私保护，可以把它迁移到 Supabase / Firebase / Cloudflare Workers 等后端方案，前端展示逻辑可以直接复用。</p>
        </section>

        <section class="about-sec reveal" data-delay="3">
          <h2>关于作者</h2>
          <p>作者：王凯跃 —— 2023级7班班长。</p>
          <p>这个网站，是他送给七班的毕业礼物：把三年的照片、声音和没说出口的话，都收进一座线上纪念馆。很多年后，当大家散落在不同的城市，随时可以回来看看。</p>
        </section>

        <section class="about-sec reveal" data-delay="4">
          <h2>致谢</h2>
          <p>感谢三年里教过我们的每一位老师，感谢每一个在七班出现过的人。</p>
          <p class="about-em">我们曾经是 2023级7班。</p>
        </section>
      </div>
    </div>`;
  }
};

GM.router.register('/about', () => GM.pages.about.render());
