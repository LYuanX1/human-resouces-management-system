import { getKV, read, ensureSeed, json, requireUser, unauthorized, pseudo } from '../_lib/kv.js';

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const url = new URL(context.request.url);
    const name = url.searchParams.get('name');
    const id = url.searchParams.get('id');
    const department = url.searchParams.get('department');
    const students = await read(kv, 'students', []);
    const data = students.filter(function (s) {
      if (name && String(s.name).indexOf(name) < 0) return false;
      if (id && String(s.id).indexOf(id) < 0) return false;
      if (department && s.department !== department) return false;
      return true;
    }).map(function (s) {
      const days = 15 + pseudo(s.id, 16);
      return { student: s, days: days, status: days >= 22 ? '正常' : '异常' };
    });
    return json({ code: 0, data: data });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
