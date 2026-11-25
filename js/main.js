/* 主页：无独立数据接口，登录守卫与通用初始化在 common.js 中完成 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    // 保留扩展点：如需在主页展示当前用户，可在此调用 api('/mine')
    document.querySelectorAll('a[href="info.html"]').forEach(function (a) {
      a.setAttribute('title', '人事管理');
    });
  });
})();
