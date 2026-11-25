/* 公共工具：URL 转换、API 请求、登录守卫、部门标签、头像兜底 */
(function () {
  'use strict';

  // 把数据库里存的 assets/xxx.png / hrms/xxx.png / 完整 URL 统一解析成云空间 URL
  window.assetUrl = function (p) {
    if (!p || p === 'null' || p === 'undefined') return window.DEFAULT_AVATAR;
    var s = String(p);
    if (/^https?:\/\//i.test(s)) return s;
    s = s.replace(/^\//, '').replace(/^assets\//, '').replace(/^hrms\//, '');
    return window.ASSET_BASE + '/' + s;
  };

  window.escapeHtml = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  // 生成内联 onclick 里的安全 JS 字符串参数
  window.jsArg = function (v) {
    return String(v == null ? '' : v)
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      .replace(/"/g, '&quot;').replace(/</g, '&lt;');
  };

  var DEPT = {
    '突击': { label: '突击部', cls: 'dept-assault' },
    '支援': { label: '支援部', cls: 'dept-support' },
    '工程': { label: '工程部', cls: 'dept-engineer' },
    '侦察': { label: '侦察部', cls: 'dept-recon' }
  };
  window.deptTag = function (dept) {
    var d = DEPT[dept];
    return d ? '<span class="dept-tag ' + d.cls + '">' + d.label + '</span>'
             : '<span class="dept-tag" style="background:#555">待定</span>';
  };

  // 统一 API 请求：自动带 token，统一错误处理
  window.api = async function (path, opts) {
    opts = opts || {};
    var headers = Object.assign({}, opts.headers || {});
    var token = localStorage.getItem(window.TOKEN_KEY);
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (opts.body && !(opts.body instanceof FormData) && typeof opts.body !== 'string') {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    var res = await fetch(window.API_BASE + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body
    });
    var data;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (res.status === 401) {
      localStorage.removeItem(window.TOKEN_KEY);
      location.href = 'index.html';
      throw new Error('登录已失效');
    }
    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || ('请求失败 (' + res.status + ')'));
    }
    return data;
  };

  window.getQuery = function (k) {
    return new URLSearchParams(location.search).get(k);
  };

  // 登录守卫：登录页不检查
  var page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html' && page !== 'login.html' && page !== '') {
    if (!localStorage.getItem(window.TOKEN_KEY)) {
      location.href = 'index.html';
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 所有占位头像先给默认值
    document.querySelectorAll('img[data-avatar]').forEach(function (img) {
      img.src = window.DEFAULT_AVATAR;
      img.onerror = function () { this.onerror = null; this.src = window.DEFAULT_AVATAR; };
    });
    // 统一处理「退出登录」
    document.querySelectorAll('a.logout, .logout').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(window.TOKEN_KEY);
        api('/logout', { method: 'POST' }).catch(function () {}).finally(function () {
          location.href = 'index.html';
        });
      });
    });
  });
})();
