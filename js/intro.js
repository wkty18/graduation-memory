/* ============================================
   开屏 Intro：2023 → 7班 → 毕业纪念馆 → 我们毕业了。
   全程约 3s，可跳过；尊重 prefers-reduced-motion
   ============================================ */
GM.intro = {
  timers: [],

  init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || localStorage.getItem('gm-intro') === 'off') { this.done(); return; }

    const root = GM.$('#intro-root');
    root.innerHTML = `
      <div class="intro">
        <div class="intro__word" id="intro-word">2023</div>
        <div class="intro__line" id="intro-line">我们毕业了。</div>
        <button class="intro__skip" id="intro-skip">跳过</button>
      </div>`;
    const word = GM.$('#intro-word');
    const line = GM.$('#intro-line');

    const words = ['2023', '7班', '毕业纪念馆'];
    let i = 0;
    const showWord = () => {
      if (i >= words.length) return;
      word.classList.remove('show');
      setTimeout(() => {
        word.textContent = words[i];
        word.classList.add('show');
        i++;
        this.timers.push(setTimeout(showWord, 700));
      }, 320);
    };
    this.timers.push(setTimeout(showWord, 250));
    this.timers.push(setTimeout(() => line.classList.add('show'), 2450));
    this.timers.push(setTimeout(() => this.done(), 3300));

    /* 跳过 */
    const skip = () => this.done();
    GM.$('#intro-skip').addEventListener('click', skip);
    GM.$('#intro-root').addEventListener('dblclick', skip);
  },

  done() {
    if (this._done) return;
    this._done = true;
    this.timers.forEach(clearTimeout);
    const root = GM.$('#intro-root');
    if (!root || !root.firstElementChild) return;
    root.firstElementChild.classList.add('intro--out');
    setTimeout(() => { root.innerHTML = ''; }, 620);
    GM.bus.emit('intro:done');
  }
};
