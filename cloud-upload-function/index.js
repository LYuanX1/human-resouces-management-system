'use strict';
/**
 * uniCloud 支付宝云「云函数」：把用户上传的头像写入云存储 hrms/upload/
 *
 * 使用步骤：
 *  1. 在 uniCloud 控制台（https://unicloud.dcloud.net.cn/）为本服务空间新建云函数，
 *     名称如 hrms-upload，把本文件内容粘贴进去并上传部署。
 *     （Web 控制台不支持新建云函数，需通过 HBuilderX 上传部署）
 *  2. 在云函数详情里开启「云函数 URL 化」，PATH 填 /hrms-upload，
 *     以控制台「复制路径」给出的完整地址为准，例如
 *     https://env-00jy736zuxjd.dev-hz.cloudbasefunction.cn/hrms-upload
 *  3. 在 EdgeOne Pages「项目设置 → 环境变量」里设置：
 *       UPLOAD_GATEWAY = 上一步的 URL
 *       UPLOAD_TOKEN   = 自拟随机字符串（必设）
 *     并在本云函数的环境变量里设置同名 UPLOAD_TOKEN，两侧值必须一致。
 *  4. 重新部署 Pages 项目，之后新增/修改头像就会真实落到 hrms/upload/ 目录。
 *
 * ⚠️ 安全说明（2026-11-25 实测）：
 *  本模板采用 fail-closed 鉴权 —— 环境变量未注入时一律拒绝上传，绝不跳过校验。
 *  但 uniCloud 云函数多实例间环境变量注入可能不一致（实测约 25% 实例读不到
 *  process.env.UPLOAD_TOKEN），此时这些实例会拒绝所有上传请求。
 *  若遇到该情况，请改用「本地部署版」：把 token 写死在函数内、不读环境变量
 *  （本地版不提交到 GitHub，避免明文 token 泄露）。
 *
 * 目录约定：静态资源 hrms/ ，动态头像 hrms/upload/ ，两者隔离。
 */
exports.main = async function (event) {
  try {
    var body = event.body;
    if (event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body || typeof body !== 'object') body = {};

    var cloudPath = body.cloudPath;
    var contentBase64 = body.contentBase64;
    if (!cloudPath || !contentBase64) return { code: 1, message: '缺少 cloudPath / contentBase64' };

    // 只允许写入隔离目录，防止路径穿越覆盖静态资源
    if (String(cloudPath).indexOf('hrms/upload/') !== 0 || String(cloudPath).indexOf('..') >= 0) {
      return { code: 1, message: 'cloudPath 必须位于 hrms/upload/ 目录下' };
    }

    // 鉴权：fail-closed。环境变量未注入时一律拒绝，绝不跳过校验。
    var expected = process.env.UPLOAD_TOKEN;
    if (!expected) {
      return { code: 1, message: '服务端未配置 UPLOAD_TOKEN，已拒绝上传' };
    }
    if (body.token !== expected) {
      return { code: 1, message: '无权上传' };
    }

    var fileContent = Buffer.from(contentBase64, 'base64');
    var res = await uniCloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: fileContent
    });
    return { code: 0, fileID: res.fileID, cloudPath: cloudPath };
  } catch (e) {
    return { code: 1, message: e.message || String(e) };
  }
};
