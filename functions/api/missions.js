import { getKV, read, write, ensureSeed, json, requireUser, unauthorized } from '../_lib/kv.js';

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    return json({ code: 0, data: await read(kv, 'missions', []) });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const body = await context.request.json();
    const list = await read(kv, 'missions', []);
    const item = {
      id: 'MS-' + Date.now(),
      title: body.title || '未命名任务',
      members: body.members || [],
      createdAt: new Date().toISOString()
    };
    list.push(item);
    await write(kv, 'missions', list);
    return json({ code: 0, data: item });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
