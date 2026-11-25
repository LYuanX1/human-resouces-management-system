import { getKV, read, write, ensureSeed, sha256, json } from '../_lib/kv.js';

export async function onRequestPost(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    const body = await context.request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const users = await read(kv, 'users', []);
    const user = users.find(function (u) { return u.username === username; });
    const hash = await sha256(password);
    if (!user || user.passwordHash !== hash) {
      return json({ code: 1, message: '账号或安全密钥错误' });
    }
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const sessions = await read(kv, 'sessions', {});
    sessions[token] = { userId: user.id, exp: Date.now() + 7 * 24 * 3600 * 1000 };
    await write(kv, 'sessions', sessions);
    return json({ code: 0, token: token, user: { id: user.id, username: user.username } });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
