import { getKV, read, ensureSeed, json, requireUser, unauthorized, pseudo } from '../_lib/kv.js';

const REASONS = [
  '采购战术手套一批，原配手套磨损严重。', '车辆维护费用，更换防弹轮胎。',
  '无人机电池组采购，备战下周演习。', '医疗物资紧急补充（止血带、绷带）。',
  '外勤任务差旅费报销（住宿/交通）。', '枪械精密维护保养工具组采购。',
  '夜视仪电池耗材补充。', '没注意，走跳水撤了',
  '从巴别塔上摔下来了', '陪唐王去找典狱长玩，忘记我是KD2.0的了',
  '去二员领AWM子弹，子弹镶脑门上了', '找鸟兽兽借火烧烤，他拿成巡飞弹了',
  '无名说跟他一起玩飞盘，他先来', '威龙说送我副耳机，我只听到滴滴声，还越来越快'
];

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const students = await read(kv, 'students', []);
    const data = students.map(function (s, i) {
      const amount = (500 + pseudo(s.id * 13 + 5, 450000) / 100).toFixed(2);
      return {
        id: 'FN-' + (2025001 + i),
        applicantId: String(s.id),
        name: s.name,
        avatar: s.avatar,
        department: s.department,
        reason: REASONS[pseudo(s.id * 7 + 3, REASONS.length)],
        amount: amount
      };
    });
    return json({ code: 0, data: data });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
