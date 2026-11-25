/* 考勤打卡：筛选 + 列表渲染 */
(function () {
  'use strict';
  function daysTag(days) {
    if (days >= 25) return '<span class="days-tag days-good">' + days + ' 天 (正常)</span>';
    if (days >= 20) return '<span class="days-tag days-warn">' + days + ' 天 (缺勤)</span>';
    return '<span class="days-tag days-bad">' + days + ' 天 (异常)</span>';
  }
  function row(rec) {
    var s = rec.student || {};
    var q = window.jsArg;
    return '<tr class="data-row">' +
      '<td><img referrerpolicy="no-referrer" src="' + window.escapeHtml(window.assetUrl(s.avatar)) + '" class="table-avatar" onerror="this.src=DEFAULT_AVATAR"></td>' +
      '<td>' + window.escapeHtml(s.id) + '</td>' +
      '<td><strong>' + window.escapeHtml(s.name) + '</strong></td>' +
      '<td>' + window.escapeHtml(s.gender) + '</td>' +
      '<td>' + window.deptTag(s.department) + '</td>' +
      '<td>' + daysTag(rec.days) + '</td>' +
      '<td style="text-align: right;"><button class="manage-btn" onclick="openManageModal(' +
        "'" + q(s.name) + "','" + q(s.id) + "','" + q(s.avatar) + '\')">考勤管理</button></td></tr>';
  }
  function table(list) {
    return '<table><thead><tr>' +
      '<th width="80">头像</th><th width="100">编号</th><th>姓名</th><th width="80">性别</th>' +
      '<th>所属部门</th><th>本月出勤天数</th><th width="100">操作</th>' +
      '</tr></thead><tbody>' + list.map(row).join('') + '</tbody></table>';
  }
  document.addEventListener('DOMContentLoaded', function () {
    var host = document.getElementById('attendanceTableHost');
    if (!host) return;
    var q = new URLSearchParams(location.search);
    var form = document.getElementById('attendanceFilterForm');
    if (form) ['department', 'name', 'id'].forEach(function (k) {
      var el = form.querySelector('[name=' + k + ']'); if (el && q.get(k)) el.value = q.get(k);
    });
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = new URLSearchParams(new FormData(form));
      Array.from(p.keys()).forEach(function (k) { if (!p.get(k)) p.delete(k); });
      location.href = 'attendance.html' + (p.toString() ? '?' + p.toString() : '');
    });
    api('/attendance' + (q.toString() ? '?' + q.toString() : '')).then(function (r) {
      host.innerHTML = (r.data && r.data.length) ? table(r.data)
        : '<div class="empty-state"><div>暂无符合条件的考勤记录</div></div>';
    }).catch(function (e) {
      host.innerHTML = '<div class="empty-state" style="color:#e74c3c">加载失败：' + window.escapeHtml(e.message) + '</div>';
    });
  });
})();
