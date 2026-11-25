/* 人事管理：列表 / 筛选 / 新增 / 修改 / 调动 / 删除 */
(function () {
  'use strict';

  function jsArg(v) {
    return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function rowHtml(s) {
    var avatar = window.assetUrl(s.avatar);
    return '<tr class="data-row">' +
      '<td><img referrerpolicy="no-referrer" src="' + window.escapeHtml(avatar) + '" class="table-avatar" onerror="this.src=DEFAULT_AVATAR"></td>' +
      '<td>' + window.escapeHtml(s.id) + '</td>' +
      '<td><strong>' + window.escapeHtml(s.name) + '</strong></td>' +
      '<td>' + window.escapeHtml(s.gender) + '</td>' +
      '<td>' + window.deptTag(s.department) + '</td>' +
      '<td><span class="major-text">' + window.escapeHtml(s.major) + '</span></td>' +
      '<td>' + window.escapeHtml(s.age) + '</td>' +
      '<td class="action-cell">' +
        '<button class="more-btn" onclick="toggleMenu(\'menu-' + s.id + '\', event)">•••</button>' +
        '<div id="menu-' + s.id + '" class="action-menu">' +
          '<a href="javascript:void(0)" onclick="openUpdateModal(' +
            "'" + jsArg(s.id) + "','" + jsArg(s.name) + "','" + jsArg(s.age) + "','" + jsArg(s.gender) + "','" +
            jsArg(s.department) + "','" + jsArg(s.major) + "','" + jsArg(s.avatar) + "')" + '" class="menu-item">✏️ 修改信息</a>' +
          '<a href="javascript:void(0)" onclick="openTransferModal(' + s.id + ",'" + jsArg(s.name) + "','" + jsArg(s.department) + '\')" class="menu-item">🔄 人事调动</a>' +
          '<a href="javascript:void(0)" onclick="openDeleteModal(' + s.id + ')" class="menu-item danger">⚠️ 解雇干员</a>' +
        '</div>' +
      '</td></tr>';
  }

  function render(list, hasFilter) {
    var host = document.getElementById('studentTableHost');
    if (!host) return;
    if (!list || !list.length) {
      host.innerHTML = hasFilter
        ? '<div class="empty-state"><div class="no-match"><div class="no-match-icon">🔍</div>' +
          '<div class="no-match-text">查无此人</div>' +
          '<button class="reset-btn" onclick="location.href=\'info.html\'">重置筛选</button></div></div>'
        : '<div class="empty-state"><button class="add-btn-large" onclick="openAddModal()"><span>+</span>添加干员</button></div>';
      return;
    }
    host.innerHTML = '<table><thead><tr>' +
      '<th width="80">照片</th><th width="80">编号</th><th>姓名</th><th width="80">性别</th>' +
      '<th>所属部门</th><th>战术专长</th><th>年龄</th><th width="50">操作</th>' +
      '</tr></thead><tbody>' + list.map(rowHtml).join('') + '</tbody></table>';
  }

  async function loadStudents() {
    var q = new URLSearchParams(location.search);
    var keys = ['department', 'gender', 'id', 'age'];
    keys.forEach(function (k) { if (q.get(k)) { /* 回显 */ } });
    // 回显筛选条件
    var form = document.getElementById('filterForm');
    if (form) keys.forEach(function (k) {
      var el = form.querySelector('[name=' + k + ']');
      if (el && q.get(k)) el.value = q.get(k);
    });
    var qs = q.toString();
    try {
      var r = await api('/students' + (qs ? '?' + qs : ''));
      render(r.data, keys.some(function (k) { return q.get(k); }));
    } catch (e) {
      document.getElementById('studentTableHost').innerHTML =
        '<div class="empty-state" style="color:#e74c3c">加载失败：' + window.escapeHtml(e.message) + '</div>';
    }
  }

  // 提交前先把头像文件上传到 hrms/upload/，再以 JSON 提交业务字段
  async function collectPayload(form) {
    var fd = new FormData(form);
    var file = fd.get('avatarFile');
    var avatar = fd.get('oldAvatar') || '';
    if (file && file.size > 0) {
      var up = new FormData();
      up.append('file', file);
      var r = await api('/upload', { method: 'POST', body: up });
      avatar = r.url;
    }
    var payload = {
      name: fd.get('name'), age: Number(fd.get('age')), gender: fd.get('gender'),
      major: fd.get('major') || '特勤组'
    };
    if (fd.get('department')) payload.department = fd.get('department');
    if (avatar) payload.avatar = avatar;
    return payload;
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadStudents();

    var filter = document.getElementById('filterForm');
    if (filter) filter.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = new URLSearchParams(new FormData(filter));
      // 去掉空值
      Array.from(q.keys()).forEach(function (k) { if (!q.get(k)) q.delete(k); });
      location.href = 'info.html' + (q.toString() ? '?' + q.toString() : '');
    });

    var addForm = document.getElementById('addForm');
    if (addForm) addForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      try {
        await api('/students', { method: 'POST', body: await collectPayload(addForm) });
        location.href = 'info.html';
      } catch (err) { alert('新增失败：' + err.message); }
    });

    var updateForm = document.getElementById('updateForm');
    if (updateForm) updateForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var id = updateForm.querySelector('#updateId').value;
      try {
        await api('/students/' + id, { method: 'PUT', body: await collectPayload(updateForm) });
        location.href = 'info.html';
      } catch (err) { alert('保存失败：' + err.message); }
    });

    var transferForm = document.getElementById('transferForm');
    if (transferForm) transferForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var fd = new FormData(transferForm);
      try {
        await api('/students/' + fd.get('id'), {
          method: 'PUT', body: { department: fd.get('department') }
        });
        location.href = 'info.html';
      } catch (err) { alert('调动失败：' + err.message); }
    });
  });

  // 覆盖原 JSP 内联脚本里的删除跳转，改为调用 API
  window.executeDelete = async function () {
    if (typeof deleteTargetId === 'undefined' || !deleteTargetId) return;
    if (!confirm('确认解雇该干员？此操作不可逆。')) return;
    try {
      await api('/students/' + deleteTargetId, { method: 'DELETE' });
      location.href = 'info.html';
    } catch (err) { alert('删除失败：' + err.message); }
  };
})();
