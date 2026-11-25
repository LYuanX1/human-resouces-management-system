/* 全局配置：改这一处即可切换云空间域名 / 目录 */
(function () {
  // uniCloud 支付宝云「内置云存储下载域名」+ 静态资源目录
  window.ASSET_BASE = 'https://env-00jy736zuxjd.normal.cloudstatic.cn/hrms';
  // 用户动态上传头像的隔离目录（与静态资源分开）
  window.UPLOAD_DIR = 'hrms/upload/';
  window.UPLOAD_BASE = window.ASSET_BASE.replace(/\/hrms$/, '') + '/' + window.UPLOAD_DIR;
  // 原项目里 avatar_default.png 缺失，实际文件名为 assetsavatar_default.png
  window.DEFAULT_AVATAR = window.ASSET_BASE + '/assetsavatar_default.png';
  window.API_BASE = '/api';
  window.TOKEN_KEY = 'hrms_token';
})();
