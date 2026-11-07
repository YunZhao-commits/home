import { DEFAULT_SETTINGS } from '../../shared/site-config.js';

export function invalid(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

export async function readBytes(request, limit) {
  if (Number(request.headers.get('Content-Length')) > limit) invalid('请求内容过大', 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); invalid('请求内容过大', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function jsonBody(request) {
  try { return JSON.parse(new TextDecoder().decode(await readBytes(request, 196608))); }
  catch (error) { if (error.status) throw error; invalid('JSON 格式无效'); }
}

function text(value, name, max, required = false) {
  if (typeof value !== 'string') invalid(`${name}格式无效`);
  const result = value.trim();
  if (result.length > max || (required && !result)) invalid(`${name}不能为空或超过长度限制`);
  return result;
}

function webUrl(value, name) {
  const url = text(value, name, 2048, true);
  try { const u = new URL(url); if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) invalid(`${name}必须是 http(s) 链接`); }
  catch { invalid(`${name}必须是 http(s) 链接`); }
  return url;
}

async function validatePost(body, db, partial) {
  const data = {};
  if (!partial && (!body.title || !body.content || !body.link_url)) invalid('标题、正文和链接必填');
  for (const [key, max] of Object.entries({ title: 160, summary: 500, content: 100000, disclosure: 2000, provider: 120 })) {
    if (body[key] !== undefined) data[key] = text(body[key], key, max, ['title', 'content'].includes(key));
  }
  if (body.link_url !== undefined) data.link_url = webUrl(body.link_url, '跳转地址');
  for (const [key, choices] of Object.entries({ status: ['draft', 'published', 'expired', 'offline', 'deleted'], link_type: ['normal', 'invite'], validity: ['permanent', 'limited'] })) {
    if (body[key] !== undefined) { if (!choices.includes(body[key])) invalid(`${key}取值无效`); data[key] = body[key]; }
  }
  if (body.category !== undefined) {
    const cat = text(body.category, '分类', 40, true);
    if (!await db.prepare('SELECT id FROM categories WHERE id = ?').bind(cat).first()) invalid('请选择存在的分类');
    data.category = cat;
  }
  if (body.cover_url !== undefined) {
    const cover = text(body.cover_url, '封面', 150);
    if (cover && !/^\/api\/media\?id=[a-f0-9]{64}$/.test(cover)) invalid('请使用本站上传的封面');
    if (cover && !await db.prepare('SELECT id FROM media WHERE id = ?').bind(cover.split('=')[1]).first()) invalid('封面不存在');
    data.cover_url = cover;
  }
  if (body.is_featured !== undefined) {
    if (![true, false, 0, 1].includes(body.is_featured)) invalid('推荐标记无效');
    data.is_featured = body.is_featured ? 1 : 0;
  }
  return data;
}

async function savePost(context) {
  const { request, env } = context;
  const body = await jsonBody(request);
  const partial = request.method === 'PUT';
  const id = partial ? text(body.id, '文章 ID', 100, true) : `post_${crypto.randomUUID()}`;
  const data = await validatePost(body, env.DB, partial);
  if (partial && !await env.DB.prepare('SELECT id FROM posts WHERE id = ?').bind(id).first()) invalid('文章不存在', 404);
  const now = new Date().toISOString();
  if (partial) {
    if (!Object.keys(data).length) invalid('没有需要保存的内容');
    const keys = Object.keys(data); // All keys came from the strict allowlist above.
    await env.DB.prepare(`UPDATE posts SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`).bind(...keys.map(k => data[k]), now, id).run();
  } else {
    const post = { title: '', summary: '', content: '', category: 'tools', link_type: 'normal', link_url: '', disclosure: '', validity: 'permanent', provider: '', status: 'draft', is_featured: 0, cover_url: '', ...data };
    if (!await env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(post.category).first()) invalid('分类不存在');
    const keys = Object.keys(post);
    await env.DB.prepare(`INSERT INTO posts (id, ${keys.join(', ')}, created_at, updated_at) VALUES (?, ${keys.map(() => '?').join(', ')}, ?, ?)`).bind(id, ...keys.map(k => post[k]), now, now).run();
  }
  return Response.json({ success: true, id });
}

async function categoriesAction({ request, env }) {
  if (request.method === 'GET') return Response.json({ data: (await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order, id').all()).results });
  if (request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) invalid('分类 ID 必填');
    // Soft-deleted posts still reference their category and must remain recoverable.
    if (await env.DB.prepare('SELECT id FROM posts WHERE category = ? LIMIT 1').bind(id).first()) invalid('该分类仍有文章，请先把文章移到其他分类', 409);
    await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return Response.json({ success: true });
  }
  if (!['POST', 'PUT'].includes(request.method)) invalid('Method not allowed', 405);
  const b = await jsonBody(request);
  const id = text(b.id, '分类标识', 40, true);
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(id) || id === 'all') invalid('分类标识须以小写字母开头，仅用字母、数字、短横线，不能使用 all');
  const name = text(b.name, '分类名称', 20, true);
  const order = Number(b.sort_order ?? 0);
  if (!Number.isInteger(order) || Math.abs(order) > 10000) invalid('排序须为 -10000 到 10000 的整数');
  if (request.method === 'POST') {
    if (await env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first()) invalid('该分类标识已经存在', 409);
    await env.DB.prepare('INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind(id, name, order).run();
  } else {
    if (!await env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first()) invalid('分类不存在', 404);
    await env.DB.prepare('UPDATE categories SET name = ?, sort_order = ? WHERE id = ?').bind(name, order, id).run();
  }
  return Response.json({ success: true });
}

async function settingsAction({ request, env }) {
  if (request.method === 'GET') {
    const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'site'").first();
    return Response.json({ data: { ...DEFAULT_SETTINGS, ...(row ? JSON.parse(row.value) : {}) } });
  }
  if (request.method !== 'PUT') invalid('Method not allowed', 405);
  const b = await jsonBody(request);
  const result = {};
  const limits = { site_name: 40, site_cn: 30, tagline: 100, quote: 200, share_intro: 500, about_intro: 1000, contact_email: 254, whatsapp_url: 2048, telegram_url: 2048 };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const optionalUrl = key.endsWith('_url');
    result[key] = text(b[key] ?? DEFAULT_SETTINGS[key], key, limits[key], !optionalUrl);
    if (optionalUrl && result[key]) result[key] = webUrl(result[key], key);
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result.contact_email)) invalid('邮箱格式无效');
  await env.DB.prepare("INSERT INTO site_settings (key, value, updated_at) VALUES ('site', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").bind(JSON.stringify(result), new Date().toISOString()).run();
  return Response.json({ success: true, data: result });
}

async function upload({ request, env }) {
  if (request.method !== 'POST') invalid('Method not allowed', 405);
  const type = request.headers.get('Content-Type')?.split(';')[0];
  if (!['image/webp', 'image/png', 'image/jpeg'].includes(type)) invalid('只支持 WebP、PNG、JPEG 图片', 415);
  const bytes = await readBytes(request, 262144);
  const magic = type === 'image/png' ? bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)
    : type === 'image/jpeg' ? bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
  if (!magic) invalid('图片内容与类型不符');
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const id = Array.from(hash, b => b.toString(16).padStart(2,'0')).join('');
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.slice(i,i+8192));
  await env.DB.prepare('INSERT OR IGNORE INTO media (id, content_type, body, created_at) VALUES (?, ?, ?, ?)').bind(id, type, btoa(binary), new Date().toISOString()).run();
  return Response.json({ success: true, url: `/api/media?id=${id}` });
}

export async function handleAction(context, action) {
  const { request, env } = context;
  if (action === 'categories') return categoriesAction(context);
  if (action === 'settings') return settingsAction(context);
  if (action === 'upload') return upload(context);
  if (action !== 'posts') invalid('Unknown action', 404);
  if (request.method === 'GET') return Response.json({ data: (await env.DB.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all()).results || [] });
  if (['POST', 'PUT'].includes(request.method)) return savePost(context);
  if (request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) invalid('文章 ID 必填');
    await env.DB.prepare("UPDATE posts SET status = 'deleted', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
    return Response.json({ success: true });
  }
  invalid('Method not allowed', 405);
}
