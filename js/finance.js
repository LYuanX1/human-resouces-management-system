/* 财务审批待办：列表渲染（数据由 /api/finance 生成，逻辑与原 Servlet 一致） */
(function () {
  'use strict';
  function row(item) {
    var q = window.jsArg;
    var reason = String(item.reason || '');
    var short = reason.length > 15 ? reason.slice(0, 15) + '...' : reason;
    var args = [item.id, item.name, item.applicantId, item.department, item.amount, item.reason, item.avatar]
      .map(function (v) { return "'" + q(v) + "'"; }).join(',');
    return '<tr class="finance-row" id="row-' + window.escapeHtml(item.id) + '">' +
      '<td><div class="applicant-cell">' +
        '<img src="' + window.escapeHtml(window.assetUrl(item.avatar)) + '" class="app-avatar" onerror="this.src=DEFAULT_AVATAR">' +
        '<div class="app-name">' + window.escapeHtml(item.name) + '</div></div></td>' +
      '<td><span class="text-label">申请ID</span><span class="text-value">' + window.escapeHtml(item.id) + '</span></td>' +
      '<td><span class="text-label">所属部门</span><span class="dept-badge">' + window.escapeHtml(item.department) + '</span></td>' +
      '<td width="40%"><div style="display: flex; justify-content: space-between; align-items: center;">' +
        '<div><span class="text-label">申请事由</span><span class="text-value" style="color:#aaa;">' + window.escapeHtml(short) + '</span></div>' +
        '<button class="btn-view" onclick="openFinanceModal(' + args + ')">查看</button></div></td>' +
      '<td style="text-align: right; padding-right: 40px;"><span class="text-label">申请金额 (CNY)</span>' +
        '<span class="amount-value">¥ ' + window.escapeHtml(item.amount) + '</span></td></tr>';
  }
  document.addEventListener('DOMContentLoaded', async function () {
    var body = document.getElementById('financeBody');
    if (!body) return;
    try {
      var r = await api('/finance');
      body.innerHTML = (r.data && r.data.length)
        ? r.data.map(row).join('')
        : '<tr><td colspan="5" style="text-align:center;padding:50px;color:#666;">当前没有待审批的报销单据</td></tr>';
    } catch (e) {
      body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:50px;color:#e74c3c;">加载失败：' + window.escapeHtml(e.message) + '</td></tr>';
    }
  });
})();
