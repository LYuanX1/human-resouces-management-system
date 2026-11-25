/* 手动重置 KV 数据（POST /api/seed），用于清空后重建初始数据 */
import { getKV, ensureSeed, json, requireUser, unauthorized, sha256 } from '../_lib/kv.js';
import { SEED_STUDENTS, SEED_USERS } from '../_lib/seed-data.js';

export async function onRequestPost(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const users = JSON.parse(JSON.stringify(SEED_USERS));
    users[0].passwordHash = await sha256('root');
    await kv.put('students', JSON.stringify(SEED_STUDENTS));
    await kv.put('users', JSON.stringify(users));
    await kv.put('sessions', '{}');
    await kv.put('missions', '[]');
    return json({ code: 0, message: '已恢复初始数据，请重新登录' });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
