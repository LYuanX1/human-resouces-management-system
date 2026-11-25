/* 独立修改档案页（update.html?id=xx） */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', async function () {
    var id = window.getQuery('id');
    if (!id) { alert('缺少干员编号'); location.href = 'info.html'; return; }
    try {
      var r = await api('/students/' + id);
      var s = r.data;
      var set = function (idSel, v) { var el = document.getElementById(idSel); if (el) el.value = v == null ? '' : v; };
      set('stuId', s.id); set('stuName', s.name); set('stuAge', s.age);
      set('oldAvatar', s.avatar);
      var img = document.getElementById('avatarPreview');
      if (img) img.src = window.assetUrl(s.avatar);
      var sel = document.querySelector('select.form-input');
      if (sel) Array.from(sel.options).forEach(function (o) {
        if (o.text.indexOf(s.department) >= 0) sel.value = o.value;
      });
      var radios = document.querySelectorAll('input[name=gender]');
      radios.forEach(function (x) { x.checked = (x.value === s.gender); });
    } catch (e) { alert('加载档案失败：' + e.message); }

    var form = document.getElementById('updateForm');
    if (form) form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var file = fd.get('avatarFile');
      var avatar = fd.get('oldAvatar') || '';
      try {
        if (file && file.size > 0) {
          var up = new FormData(); up.append('file', file);
          var res = await api('/upload', { method: 'POST', body: up });
          avatar = res.url;
        }
        await api('/students/' + id, {
          method: 'PUT',
          body: { name: fd.get('name'), age: Number(fd.get('age')), gender: fd.get('gender'), avatar: avatar }
        });
        location.href = 'info.html';
      } catch (err) { alert('保存失败：' + err.message); }
    });
  });
})();
