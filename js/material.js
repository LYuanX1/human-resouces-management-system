/* 物资申领审批：列表渲染 */
(function () {
  'use strict';
  var GEAR = {
    '新兵制式装备': 'gear-recruit', '标准制式装备': 'gear-standard', '精锐制式装备': 'gear-elite',
    '特种制式装备': 'gear-special', '定制装备': 'gear-custom'
  };
  function gearBadge(t) {
    var cls = GEAR[t];
    return cls ? '<span class="gear-badge ' + cls + '">' + (t === '定制装备' ? '★ 定制装备 ★' : t) + '</span>'
               : '<span class="gear-badge">' + window.escapeHtml(t) + '</span>';
  }
  function row(item) {
    var q = window.jsArg;
    var args = [item.id, item.name, item.applicantId, item.department, item.materialType, item.reason, item.avatar]
      .map(function (v) { return "'" + q(v) + "'"; }).join(',');
    return '<tr class="mat-row" id="row-' + window.escapeHtml(item.id) + '">' +
      '<td><div class="applicant-box">' +
        '<img src="' + window.escapeHtml(window.assetUrl(item.avatar)) + '" class="app-avatar" onerror="this.src=DEFAULT_AVATAR">' +
        '<div class="app-name">' + window.escapeHtml(item.name) + '</div></div></td>' +
      '<td><span class="text-label">单据编号</span><span class="text-value">' + window.escapeHtml(item.id) + '</span></td>' +
      '<td><span class="text-label">所属部门</span><span class="dept-badge">' + window.escapeHtml(item.department) + '</span></td>' +
      '<td><span class="text-label">申请物资</span>' + gearBadge(item.materialType) + '</td>' +
      '<td width="20%" style="text-align: right;"><button class="btn-view" onclick="openDetailModal(' + args + ')">查看事由</button></td></tr>';
  }
  document.addEventListener('DOMContentLoaded', async function () {
    var body = document.getElementById('materialBody');
    if (!body) return;
    try {
      var r = await api('/material');
      body.innerHTML = (r.data && r.data.length)
        ? r.data.map(row).join('')
        : '<tr><td colspan="5" style="text-align:center;padding:50px;color:#666;">暂无待审批的物资申领</td></tr>';
    } catch (e) {
      body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:50px;color:#e74c3c;">加载失败：' + window.escapeHtml(e.message) + '</td></tr>';
    }
  });
})();
