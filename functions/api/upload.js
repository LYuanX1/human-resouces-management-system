/* 头像上传：目标目录 hrms/upload/（与静态资源 hrms/ 隔离）
 *
 * 优先模式（推荐）：在 EdgeOne Pages 项目环境变量里配置 UPLOAD_GATEWAY，
 * 指向 uniCloud 支付宝云中已 URL 化的上传云函数地址。文件会被真实写入
 * hrms/upload/<uuid>.<ext>，返回云空间公有读 URL。
 * 云函数代码见仓库 cloud-upload-function/index.js。
 *
 * 降级模式：未配置 UPLOAD_GATEWAY 时，图片暂存到 KV（key = avatar:<uuid>），
 * 通过 /api/avatar/<uuid> 访问。功能可用，但文件不在云存储目录里。
 */
import { getKV, write, json, requireUser, unauthorized, UPLOAD_DIR, UPLOAD_BASE } from '../_lib/kv.js';

const MAX_BYTES = 10 * 1024 * 1024; // 与原 Servlet maxFileSize 10MB 一致
const MIME_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };

export async function onRequestPost(context) {
  try {
    const kv = getKV(context.env);
    if (!await requireUser(context.request, kv)) return unauthorized();

    const form = await context.request.formData();
    const file = form.get('file');
    if (!file || !file.size) return json({ code: 1, message: '未收到头像文件' }, 400);
    if (file.size > MAX_BYTES) return json({ code: 1, message: '头像不能超过 10MB' }, 400);

    const name = String(file.name || 'avatar.png');
    const dot = name.lastIndexOf('.');
    let ext = dot >= 0 ? name.slice(dot).toLowerCase() : '.png';
    if (MIME_EXT[file.type]) ext = MIME_EXT[file.type];
    if (!['.jpg', '.png', '.gif', '.webp'].includes(ext)) {
      return json({ code: 1, message: '仅支持 jpg / png / gif / webp 图片' }, 400);
    }

    const key = crypto.randomUUID().replace(/-/g, '') + ext;
    const cloudPath = UPLOAD_DIR + key;

    // 文件内容转 base64（分块，避免大图超出参数长度限制）
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    const b64 = btoa(binary);

    // ---- 优先：真实写入云存储 hrms/upload/ ----
    const gateway = context.env && context.env.UPLOAD_GATEWAY;
    if (gateway) {
      const resp = await fetch(gateway, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudPath: cloudPath,
          contentBase64: b64,
          contentType: file.type || 'image/png',
          token: (context.env && context.env.UPLOAD_TOKEN) || ''
        })
      });
      let result = {};
      try { result = await resp.json(); } catch (e) { /* 忽略非 JSON 响应 */ }
      if (!resp.ok || (result.code !== undefined && result.code !== 0)) {
        return json({ code: 1, message: '云空间上传失败：' + (result.message || resp.status) }, 502);
      }
      return json({ code: 0, url: UPLOAD_BASE + key, cloudPath: cloudPath, storage: 'cloud' });
    }

    // ---- 降级：暂存 KV ----
    await write(kv, 'avatar:' + key, {
      mime: file.type || 'image/png',
      data: b64,
      cloudPath: cloudPath
    });
    return json({ code: 0, url: '/api/avatar/' + key, cloudPath: cloudPath, storage: 'kv-fallback' });
  } catch (e) {
    return json({ code: 500, message: '上传处理失败：' + e.message }, 500);
  }
}
