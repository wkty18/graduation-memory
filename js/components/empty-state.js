/* ============================================
   统一空状态
   ============================================ */
GM.emptyState = ({ glyph = '空', title = '这里暂时没有回忆。', desc = '' }) => `
  <div class="empty">
    <div class="empty__glyph">${GM.escapeHtml(glyph)}</div>
    <div class="empty__title">${GM.escapeHtml(title)}</div>
    ${desc ? `<div class="empty__desc">${GM.escapeHtml(desc)}</div>` : ''}
  </div>`;
