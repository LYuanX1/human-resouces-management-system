import { getKV, read, write, json } from '../_lib/kv.js';

export async function onRequestPost(context) {
  try {
    const kv = getKV(context.env);
    const auth = context.request.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const sessions = await read(kv, 'sessions', {});
      delete sessions[token];
      await write(kv, 'sessions', sessions);
    }
    return json({ code: 0 });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
