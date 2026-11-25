/* 个人中心：资料读取与修改（头像走 /api/upload -> hrms/upload/） */
(function () {
  'use strict';
  function fill(u) {
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v == null ? '--' : v; };
    set('profileName', u.username);
    set('profileId', u.id);
    set('profileGender', u.gender);
    set('profileSignature', u.signature || '暂无签名');
    var url = window.assetUrl(u.avatar);
    ['navAvatar', 'profileAvatar'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.src = url;
    });
    document.querySelectorAll('img[data-avatar]').forEach(function (img) { img.src = url; });
    var nameInput = document.querySelector('#profileForm [name=username]');
    if (nameInput) nameInput.value = u.username;
    var old = document.querySelector('#profileForm [name=oldAvatar]');
    if (old) old.value = u.avatar || '';
  }

  document.addEventListener('DOMContentLoaded', async function () {
    try {
      var r = await api('/mine');
      fill(r.data);
    } catch (e) { /* 守卫会处理未登录 */ }

    var form = document.getElementById('profileForm');
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
        var body = { username: fd.get('username') };
        if (fd.get('signature')) body.signature = fd.get('signature');
        if (fd.get('gender')) body.gender = fd.get('gender');
        if (avatar) body.avatar = avatar;
        await api('/mine', { method: 'PUT', body: body });
        location.reload();
      } catch (err) { alert('保存失败：' + err.message); }
    });
  });
})();
