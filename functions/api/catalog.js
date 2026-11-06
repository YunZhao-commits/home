import { DEFAULT_SETTINGS } from '../../shared/site-config.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const categories = await env.DB.prepare('SELECT id, name, sort_order FROM categories ORDER BY sort_order, id').all();
    const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'site'").first();
    return Response.json({ categories: categories.results || [], settings: { ...DEFAULT_SETTINGS, ...(row ? JSON.parse(row.value) : {}) } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: '站点配置暂时不可用' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
