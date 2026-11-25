import { getKV, read, ensureSeed, json, requireUser, unauthorized, pseudo } from '../_lib/kv.js';

const GEAR = ['新兵制式装备', '标准制式装备', '精锐制式装备', '特种制式装备', '定制装备'];
const REASONS = [
  '新兵入列，申请基础单兵作战套件。', "原装备在'零号大坝'行动中损毁，申请补发。",
  '晋升考核通过，申请换装高阶装备。', '执行潜入任务，需要轻量化特种装备。',
  '枪械部件老化，申请更换整套维护工具及备件。', '为应对极端天气，申请极地作战服。'
];

export async function onRequestGet(context) {
  try {
    const kv = getKV(context.env);
    await ensureSeed(kv);
    if (!await requireUser(context.request, kv)) return unauthorized();
    const students = await read(kv, 'students', []);
    const data = students.map(function (s, i) {
      let gear = GEAR[pseudo(s.id * 11 + 2, GEAR.length)];
      if (pseudo(s.id, 10) > 8) gear = '定制装备';
      return {
        id: 'MT-202512-' + (1024 + i),
        applicantId: String(s.id),
        name: s.name,
        avatar: s.avatar,
        department: s.department,
        reason: REASONS[pseudo(s.id * 3 + 1, REASONS.length)],
        materialType: gear
      };
    });
    return json({ code: 0, data: data });
  } catch (e) {
    return json({ code: 500, message: e.message }, 500);
  }
}
