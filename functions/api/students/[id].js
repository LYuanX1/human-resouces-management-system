import { getKV, read, write, ensureSeed, json, requireUser, unauthorized } from '../../_lib/kv.js';

function idOf(context) {
  return String(context.params && context.params.id || '');
}

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const list = await read(kv, 'students', []);
    const s = list.find(function (x) { return String(x.id) === idOf(context); });
    return s ? json({ code: 0, data: s }) : json({ code: 1, message: '干员不存在' }, 404);
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}

export async function onRequestPut(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const body = await context.request.json();
    const list = await read(kv, 'students', []);
    const idx = list.findIndex(function (x) { return String(x.id) === idOf(context); });
    if (idx < 0) return json({ code: 1, message: '干员不存在' }, 404);
    const allowed = ['name', 'age', 'gender', 'major', 'department', 'avatar'];
    allowed.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined && body[k] !== '') {
        list[idx][k] = k === 'age' ? Number(body[k]) : body[k];
      }
    });
    await write(kv, 'students', list);
    return json({ code: 0, data: list[idx] });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const list = await read(kv, 'students', []);
    const next = list.filter(function (x) { return String(x.id) !== idOf(context); });
    await write(kv, 'students', next);
    return json({ code: 0 });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
