/* 任务派遣：填充可选干员卡片，原页面的派遣交互逻辑保持不变 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', async function () {
    var grid = document.getElementById('operatorGrid');
    if (!grid) return;
    try {
      var r = await api('/students');
      grid.innerHTML = (r.data || []).map(function (s) {
        return '<div class="op-card" id="op-card-' + window.escapeHtml(s.id) + '"' +
          ' data-id="' + window.escapeHtml(s.id) + '"' +
          ' data-name="' + window.escapeHtml(s.name) + '"' +
          ' data-avatar="' + window.escapeHtml(window.assetUrl(s.avatar)) + '"' +
          ' onclick="handleSelect(this)">' +
          '<img referrerpolicy="no-referrer" src="' + window.escapeHtml(window.assetUrl(s.avatar)) + '" class="op-img" onerror="this.src=DEFAULT_AVATAR">' +
          '<div class="op-txt">' + window.escapeHtml(s.name) + '</div></div>';
      }).join('');
    } catch (e) {
      grid.innerHTML = '<div style="color:#e74c3c;padding:20px">干员列表加载失败：' + window.escapeHtml(e.message) + '</div>';
    }
  });
})();
