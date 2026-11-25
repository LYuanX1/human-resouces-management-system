/* 登录页（index.html 弹窗 / login.html 表单共用） */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type=submit]');
        var username = form.querySelector('[name=username]').value.trim();
        var password = form.querySelector('[name=password]').value;
        if (btn) { btn.disabled = true; btn.innerText = '正在验证…'; }
        try {
          var r = await api('/login', { method: 'POST', body: { username: username, password: password } });
          localStorage.setItem(window.TOKEN_KEY, r.token);
          location.href = 'main.html';
        } catch (err) {
          alert('接入失败：' + err.message);
          if (btn) { btn.disabled = false; btn.innerText = '确认接入系统'; }
        }
      });
    }
    if (window.getQuery('error')) {
      var tip = document.createElement('div');
      tip.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:10px 20px;border-radius:6px;z-index:999';
      tip.innerText = '账号或密钥错误，请重试';
      document.body.appendChild(tip);
      setTimeout(function () { tip.remove(); }, 3000);
      if (typeof openModal === 'function') openModal();
    }
    // 已登录用户访问独立登录页时直接进主页
    if (location.pathname.indexOf('login.html') >= 0 && localStorage.getItem(window.TOKEN_KEY)) {
      location.href = 'main.html';
    }
  });
})();
