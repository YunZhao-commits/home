import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as admin } from '../functions/api/admin.js';
import { onRequest as posts } from '../functions/api/posts.js';
import { onRequest as catalog } from '../functions/api/catalog.js';
import { onRequest as media } from '../functions/api/media.js';
import { onRequest as broadcast } from '../functions/api/broadcast.js';
import { onRequest as views } from '../functions/api/views.js';

const db = new DatabaseSync(':memory:');
const env = { ADMIN_PASSWORD: 'local-test-password-only' };
const schema = await readFile(new URL('../functions/schema.sql', import.meta.url), 'utf8');

class D1Statement {
  constructor(sql) { this.sql = sql; this.params = []; }
  bind(...params) { this.params = params; return this; }
  async first() { return db.prepare(this.sql).get(...this.params) ?? null; }
  async all() { return { results: db.prepare(this.sql).all(...this.params) }; }
  async run() { return { meta: db.prepare(this.sql).run(...this.params) }; }
}
env.DB = { prepare: sql => new D1Statement(sql) };

let token;
let postId;
let coverUrl;
const origin = 'http://localhost:5173';

function context(url, method = 'GET', { body, headers = {} } = {}) {
  const request = new Request(url, {
    method,
    headers: { Origin: origin, Host: 'localhost:5173', ...headers },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  });
  return { request, env, waitUntil: promise => promise.catch(() => {}) };
}

async function adminCall(action = 'posts', method = 'GET', options = {}) {
  const url = new URL(`http://localhost:5173/api/admin?action=${action}`);
  if (options.id) url.searchParams.set('id', options.id);
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  const request = new Request(url, {
    method,
    headers: { Origin: origin, Host: 'localhost:5173', ...headers },
    ...(options.raw === undefined ? (options.body === undefined ? {} : { body: JSON.stringify(options.body) }) : { body: options.raw }),
  });
  return admin({ request, env, waitUntil: promise => promise.catch(() => {}) });
}

before(() => db.exec(schema));
after(() => db.close());

test('未登录不能读写管理数据；登录签发有效会话', async () => {
  const configuredPassword = env.ADMIN_PASSWORD;
  env.ADMIN_PASSWORD = '';
  const missingSecret = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', { body: { password: 'x' } }));
  assert.equal(missingSecret.status, 503);
  env.ADMIN_PASSWORD = configuredPassword;
  const blocked = await adminCall('posts');
  assert.equal(blocked.status, 401);
  const denied = await adminCall('posts', 'POST', { body: { title: 'blocked' } });
  assert.equal(denied.status, 401);
  const login = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', { body: { password: 'wrong' } }));
  assert.equal(login.status, 401);
  const success = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', { body: { password: env.ADMIN_PASSWORD } }));
  assert.equal(success.status, 200);
  token = (await success.json()).token;
  assert.ok(token);
  const malformed = await admin({ request: new Request('http://localhost:5173/api/admin?action=posts', { headers: { Origin: origin, Host: 'localhost:5173', Authorization: `Bearer ${token}.extra` } }), env });
  assert.equal(malformed.status, 401);
});

test('管理员登录尝试使用 D1 共享限流，且只保存加密指纹', async () => {
  const ip = '198.51.100.44';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', {
      body: { password: 'wrong-password' },
      headers: { 'CF-Connecting-IP': ip },
    }));
    assert.equal(response.status, 401);
  }
  const stored = db.prepare('SELECT ip_hash, attempts FROM admin_login_limits').all();
  assert.equal(stored.length, 1);
  assert.ok(stored.every(row => !row.ip_hash.includes(ip) && /^[a-f0-9]{64}$/.test(row.ip_hash)));
  assert.equal(stored[0].attempts, 5);
  for (let attempt = 6; attempt <= 7; attempt += 1) {
    const limited = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', {
      body: { password: 'wrong-password' },
      headers: { 'CF-Connecting-IP': ip },
    }));
    assert.equal(limited.status, 429);
    assert.equal(db.prepare('SELECT attempts FROM admin_login_limits WHERE ip_hash = ?').get(stored[0].ip_hash).attempts, 5);
  }
  db.prepare('UPDATE admin_login_limits SET window_started = ? WHERE ip_hash = ?')
    .run(Date.now() - 60001, stored[0].ip_hash);
  const restarted = await admin(context('http://localhost:5173/api/admin?action=login', 'POST', {
    body: { password: 'wrong-password' },
    headers: { 'CF-Connecting-IP': ip },
  }));
  assert.equal(restarted.status, 401);
  assert.equal(db.prepare('SELECT attempts FROM admin_login_limits WHERE ip_hash = ?').get(stored[0].ip_hash).attempts, 1);
});

test('旧版公开写入与访问量接口已关闭', async () => {
  const oldWrite = await broadcast({ request: new Request('https://191607.xyz/api/broadcast', { method: 'POST' }), env });
  const oldCounter = await views({ request: new Request('https://191607.xyz/api/views'), env });
  assert.equal(oldWrite.status, 410);
  assert.equal(oldCounter.status, 410);
});

test('公开文章接口不再把数据库异常细节返回给访客', async () => {
  const broken = await posts({
    request: new Request('https://191607.xyz/api/posts'),
    env: { DB: { prepare: () => { throw new Error('private-schema-detail'); } } },
  });
  assert.equal(broken.status, 500);
  assert.equal((await broken.json()).error, '精选分享暂时不可用，请稍后重试');
});

test('旧版 D1 升级脚本保留文章和 page_views，只补充管理所需字段与表', async () => {
  const oldDb = new DatabaseSync(':memory:');
  oldDb.exec(`
    CREATE TABLE posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT, content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'tools', link_type TEXT NOT NULL DEFAULT 'normal', link_url TEXT NOT NULL,
      disclosure TEXT, validity TEXT DEFAULT 'permanent', provider TEXT, status TEXT NOT NULL DEFAULT 'draft',
      is_featured INTEGER DEFAULT 0, view_count INTEGER DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE page_views (id INTEGER PRIMARY KEY);
    INSERT INTO posts (id, title, content, link_url, created_at, updated_at) VALUES ('keep-me', 'existing', 'body', 'https://example.com', '2025-01-01', '2025-01-01');
    INSERT INTO page_views (id) VALUES (7);
  `);
  const migration = await readFile(new URL('../functions/catalog_schema.sql', import.meta.url), 'utf8');
  oldDb.exec(migration);
  assert.ok(oldDb.prepare("SELECT name FROM pragma_table_info('posts') WHERE name = 'cover_url'").get());
  assert.equal(oldDb.prepare('SELECT title FROM posts WHERE id = ?').get('keep-me').title, 'existing');
  assert.equal(oldDb.prepare('SELECT id FROM page_views').get().id, 7);
  assert.equal(oldDb.prepare('SELECT COUNT(*) AS count FROM categories').get().count, 3);
  assert.ok(oldDb.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'site_settings'").get());
  oldDb.close();
});

test('公开配置、分类可正常读取；管理设置不会越权修改密码', async () => {
  const publicConfig = await catalog({ request: new Request('https://191607.xyz/api/catalog'), env });
  assert.equal(publicConfig.status, 200);
  const config = await publicConfig.json();
  assert.deepEqual(config.categories.map(item => item.id), ['tools', 'vip', 'deals']);
  assert.equal(config.settings.site_name, 'Yunchu Studio');
  assert.equal(config.settings.whatsapp_url, '');
  assert.equal(config.settings.telegram_url, '');

  const create = await adminCall('categories', 'POST', { body: { id: 'resources', name: '资源', sort_order: 40 } });
  assert.equal(create.status, 200);
  const update = await adminCall('categories', 'PUT', { body: { id: 'resources', name: '精选资源', sort_order: 5 } });
  assert.equal(update.status, 200);
  const publicUpdated = await catalog({ request: new Request('https://191607.xyz/api/catalog'), env });
  assert.equal((await publicUpdated.json()).categories[0].name, '精选资源');

  const settings = { ...config.settings, site_name: '云初精选' };
  const saved = await adminCall('settings', 'PUT', { body: settings });
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).data.site_name, '云初精选');
  const socials = await adminCall('settings', 'PUT', { body: { ...settings, telegram_url:'https://t.me/example', whatsapp_url:'' } });
  assert.equal(socials.status, 200);
  assert.equal((await socials.json()).data.telegram_url, 'https://t.me/example');
  assert.equal((await adminCall('settings', 'PUT', { body: { ...settings, whatsapp_url:'javascript:alert(1)' } })).status, 400);
  const invalid = await adminCall('settings', 'PUT', { body: { ...settings, contact_email: 'not-an-email' } });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, '邮箱格式无效');
  assert.equal(Object.hasOwn((await (await adminCall('settings')).json()).data, 'ADMIN_PASSWORD'), false);
});

test('草稿创建、发布、查询、分页搜索、下架与回收站恢复', async () => {
  const draft = await adminCall('posts', 'POST', { body: {
    title: '测试分享条目', summary: '临时接口验收条目', content: '只用于本地测试',
    category: 'resources', link_url: 'https://example.com/resource', link_type: 'invite',
    status: 'draft', validity: 'limited', provider: '测试平台', disclosure: '测试说明',
  } });
  assert.equal(draft.status, 200);
  postId = (await draft.json()).id;
  let publicList = await posts({ request: new Request('https://191607.xyz/api/posts'), env, waitUntil: () => {} });
  assert.deepEqual((await publicList.json()).data, []);
  const publish = await adminCall('posts', 'PUT', { body: { id: postId, status: 'published', is_featured: true } });
  assert.equal(publish.status, 200);
  publicList = await posts({ request: new Request('https://191607.xyz/api/posts?keyword=测试分享&page=1'), env, waitUntil: () => {} });
  const listBody = await publicList.json();
  assert.equal(listBody.data.length, 1);
  assert.equal(listBody.total, 1);
  assert.equal(listBody.data[0].disclosure, '测试说明');
  assert.equal(listBody.data[0].is_featured, 1);
  const detail = await posts({ request: new Request(`https://191607.xyz/api/posts?id=${postId}`), env, waitUntil: () => {} });
  const detailBody = await detail.json();
  assert.equal(detailBody.data.id, postId);
  assert.equal(Object.hasOwn(detailBody.data, 'view_count'), false);
  assert.equal(db.prepare('SELECT view_count FROM posts WHERE id = ?').get(postId).view_count, 0);
  const invalidUrl = await adminCall('posts', 'PUT', { body: { id: postId, link_url: 'javascript:alert(1)' } });
  assert.equal(invalidUrl.status, 400);

  const offline = await adminCall('posts', 'PUT', { body: { id: postId, status: 'offline' } });
  assert.equal(offline.status, 200);
  publicList = await posts({ request: new Request('https://191607.xyz/api/posts'), env, waitUntil: () => {} });
  assert.equal((await publicList.json()).data.length, 0);
  const recover = await adminCall('posts', 'PUT', { body: { id: postId, status: 'draft' } });
  assert.equal(recover.status, 200);
  const trash = await adminCall('posts', 'DELETE', { id: postId });
  assert.equal(trash.status, 200);
  assert.equal(db.prepare('SELECT status FROM posts WHERE id = ?').get(postId).status, 'deleted');
  const deletedNotPublic = await posts({ request: new Request(`https://191607.xyz/api/posts?id=${postId}`), env, waitUntil: () => {} });
  assert.equal(deletedNotPublic.status, 404);
  assert.equal((await adminCall('posts', 'PUT', { body: { id: postId, status: 'draft' } })).status, 200);
});

test('封面上传限类型、校验签名、可取回；文章引用可安全校验', async () => {
  const unauthorized = await admin({ request: new Request('https://191607.xyz/api/admin?action=upload', { method: 'POST', headers: { Origin: origin, Host: 'localhost:5173', 'Content-Type': 'image/png' }, body: new Uint8Array([137,80,78,71,13,10,26,10]) }), env });
  assert.equal(unauthorized.status, 401);
  const wrongType = await adminCall('upload', 'POST', { raw: new Uint8Array([1, 2, 3]), headers: { 'Content-Type': 'image/gif' } });
  assert.equal(wrongType.status, 415);
  const invalidMagic = await adminCall('upload', 'POST', { raw: new Uint8Array([1, 2, 3]), headers: { 'Content-Type': 'image/png' } });
  assert.equal(invalidMagic.status, 400);
  const tooLarge = await adminCall('upload', 'POST', { raw: new Uint8Array(262145), headers: { 'Content-Type': 'image/png' } });
  assert.equal(tooLarge.status, 413);
  const bytes = new Uint8Array([137,80,78,71,13,10,26,10,0,1,2,3]);
  const upload = await adminCall('upload', 'POST', { raw: bytes, headers: { 'Content-Type': 'image/png' } });
  assert.equal(upload.status, 200);
  coverUrl = (await upload.json()).url;
  assert.match(coverUrl, /^\/api\/media\?id=[a-f0-9]{64}$/);
  const update = await adminCall('posts', 'PUT', { body: { id: postId, cover_url: coverUrl } });
  assert.equal(update.status, 200);
  const mediaId = new URL(`https://191607.xyz${coverUrl}`).searchParams.get('id');
  const image = await media({ request: new Request(`https://191607.xyz/api/media?id=${mediaId}`), env });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), bytes);
  const bad = await adminCall('posts', 'PUT', { body: { id: postId, cover_url: 'https://evil.example/image.png' } });
  assert.equal(bad.status, 400);
  assert.equal((await media({ request: new Request('https://191607.xyz/api/media?id=bad'), env })).status, 404);
});

test('有文章引用的分类不能删除，空分类可删除；无效 Origin 被拒绝', async () => {
  const conflict = await adminCall('categories', 'DELETE', { id: 'resources' });
  assert.equal(conflict.status, 409);
  const move = await adminCall('posts', 'PUT', { body: { id: postId, category: 'tools' } });
  assert.equal(move.status, 200);
  assert.equal((await adminCall('categories', 'DELETE', { id: 'resources' })).status, 200);
  const blocked = await admin({ request: new Request('https://191607.xyz/api/admin?action=posts', { headers: { Origin: 'https://attacker.example', Host: '191607.xyz' } }), env });
  assert.equal(blocked.status, 403);
});
