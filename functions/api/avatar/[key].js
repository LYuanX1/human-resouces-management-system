/* 降级模式下的头像读取端点：/api/avatar/<uuid> */
import { getKV, read } from '../../_lib/kv.js';

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    const item = await read(kv, 'avatar:' + (context.params && context.params.key), null);
    if (!item || !item.data) return new Response('Not Found', { status: 404 });
    const bin = atob(item.data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, {
      headers: {
        'Content-Type': item.mime || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (e) {
    return new Response('Server Error', { status: 500 });
  }
}
