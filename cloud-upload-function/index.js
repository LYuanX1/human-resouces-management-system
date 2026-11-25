'use strict';
/**
 * uniCloud 支付宝云「云函数」：把用户上传的头像写入云存储 hrms/upload/
 *
 * 使用步骤：
 *  1. 在 uniCloud 控制台（https://unicloud.dcloud.net.cn/）为本服务空间新建云函数，
 *     名称如 hrms-upload，把本文件内容粘贴进去并上传部署。
 *  2. 在云函数详情里开启「云函数 URL 化」，得到形如
 *     https://env-00jy736zuxjd.api-hz.cloudbasefunction.cn/hrms-upload 的地址。
 *  3. 在 EdgeOne Pages 项目「环境变量」里设置：
 *       UPLOAD_GATEWAY = 上一步的 URL
 *       UPLOAD_TOKEN   = 自定义一串随机字符串（可选，建议设置）
 *     并在本云函数的环境变量里设置同名 UPLOAD_TOKEN。
 *  4. 重新部署 Pages 项目，之后新增/修改头像就会真实落到 hrms/upload/ 目录。
 *
 * 目录约定：静态资源 hrms/ ，动态头像 hrms/upload/ ，两者隔离。
 */
exports.main = async function (event) {
  try {
    var body = event.body;
    if (event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
    if (typeof body === 'string') body = JSON.parse(body);
    if (body && body.action !== undefined) { /* 兼容 path 触发 */ }

    var cloudPath = body.cloudPath;
    var contentBase64 = body.contentBase64;
    if (!cloudPath || !contentBase64) return { code: 1, message: '缺少 cloudPath / contentBase64' };

    // 只允许写入隔离目录，防止路径穿越覆盖静态资源
    if (String(cloudPath).indexOf('hrms/upload/') !== 0) {
      return { code: 1, message: 'cloudPath 必须位于 hrms/upload/ 目录下' };
    }

    // 可选的简单鉴权
    var expected = process.env.UPLOAD_TOKEN;
    if (expected && body.token !== expected) {
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
