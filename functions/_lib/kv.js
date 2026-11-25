/* EdgeOne Pages KV 数据层
 * 绑定名固定为 STUDENT_KV（控制台「KV 存储 -> 绑定命名空间」时填写的变量名）
 */
import { SEED_STUDENTS, SEED_USERS } from './seed-data.js';

export const ASSET_BASE = 'https://env-00jy736zuxjd.normal.cloudstatic.cn/hrms';
export const UPLOAD_DIR = 'hrms/upload/';
export const UPLOAD_BASE = 'https://env-00jy736zuxjd.normal.cloudstatic.cn/' + UPLOAD_DIR;
export const DEFAULT_AVATAR = ASSET_BASE + '/assetsavatar_default.png';

export function getKV(env) {
  const kv = (env && env.STUDENT_KV) ||
    (typeof STUDENT_KV !== 'undefined' ? STUDENT_KV : null);
  if (!kv) {
    throw new Error('KV 未绑定：请在 EdgeOne Pages 控制台把 KV 命名空间绑定到本项目，变量名填 STUDENT_KV，然后重新部署一次');
  }
  return kv;
}

export async function read(kv, key, fallback) {
  const raw = await kv.get(key);
  if (raw == null) return fallback;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  return raw;
}

export async function write(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function (b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

export function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

/* 首次访问时自动写入初始数据（来自原 stu_db.txt），无需手工导入 */
export async function ensureSeed(kv) {
  const flag = await kv.get('__seeded__');
  if (flag) return;
  const users = JSON.parse(JSON.stringify(SEED_USERS));
  users[0].passwordHash = await sha256('root');
  users[0].avatar = DEFAULT_AVATAR;
  await write(kv, 'students', SEED_STUDENTS);
  await write(kv, 'users', users);
  await write(kv, 'sessions', {});
  await write(kv, 'missions', []);
  await kv.put('__seeded__', '1');
}

export async function requireUser(request, kv) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const sessions = await read(kv, 'sessions', {});
  const session = sessions[token];
  if (!session || (session.exp && session.exp < Date.now())) return null;
  const users = await read(kv, 'users', []);
  return users.find(function (u) { return u.id === session.userId; }) || null;
}

export function unauthorized() {
  return json({ code: 401, message: '登录已失效，请重新登录' }, 401);
}

/* 确定性伪随机：让考勤 / 报销 / 物资列表在刷新时保持稳定（原 Servlet 为每次随机） */
export function pseudo(seed, modulo) {
  return (seed * 37 + 11) % modulo;
}
