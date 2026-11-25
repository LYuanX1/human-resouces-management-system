import { getKV, read, write, ensureSeed, json, requireUser, unauthorized, DEFAULT_AVATAR } from '../_lib/kv.js';

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const url = new URL(context.request.url);
    let list = await read(kv, 'students', []);
    const department = url.searchParams.get('department');
    const gender = url.searchParams.get('gender');
    const id = url.searchParams.get('id');
    const age = url.searchParams.get('age');
    if (department) list = list.filter(function (s) { return s.department === department; });
    if (gender) list = list.filter(function (s) { return s.gender === gender; });
    if (id) list = list.filter(function (s) { return String(s.id) === String(id); });
    if (age) list = list.filter(function (s) { return String(s.age) === String(age); });
    return json({ code: 0, data: list });
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
    if (!body.name) return json({ code: 1, message: '姓名不能为空' });
    const list = await read(kv, 'students', []);
    const nextId = list.length ? Math.max.apply(null, list.map(function (s) { return s.id; })) + 1 : 1;
    const student = {
      id: nextId,
      name: String(body.name),
      age: Number(body.age) || 0,
      gender: body.gender || '男',
      major: body.major || '特勤组',
      department: body.department || '突击',
      avatar: body.avatar || DEFAULT_AVATAR
    };
    list.push(student);
    await write(kv, 'students', list);
    return json({ code: 0, data: student });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
