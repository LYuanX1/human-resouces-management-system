import { getKV, read, write, ensureSeed, json, requireUser, unauthorized } from '../_lib/kv.js';

function safe(user) {
  return {
    id: user.id, username: user.username, avatar: user.avatar,
    signature: user.signature, gender: user.gender
  };
}

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    const user = await requireUser(context.request, kv);
    if (!user) return unauthorized();
    return json({ code: 0, data: safe(user) });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}

export async function onRequestPut(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    const current = await requireUser(context.request, kv);
    if (!current) return unauthorized();
    const body = await context.request.json();
    const users = await read(kv, 'users', []);
    const idx = users.findIndex(function (u) { return u.id === current.id; });
    if (idx < 0) return unauthorized();
    ['username', 'signature', 'gender', 'avatar'].forEach(function (k) {
      if (body[k] !== undefined && body[k] !== '') users[idx][k] = body[k];
    });
    await write(kv, 'users', users);
    return json({ code: 0, data: safe(users[idx]) });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
