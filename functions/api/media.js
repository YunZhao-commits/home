export async function onRequest({ request, env }) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405 });
  const id = new URL(request.url).searchParams.get('id');
  if (!/^[a-f0-9]{64}$/.test(id || '')) return new Response(null, { status: 404 });
  try {
    const row = await env.DB.prepare('SELECT content_type, body FROM media WHERE id = ?').bind(id).first();
    if (!row) return new Response(null, { status: 404 });
    const bytes = Uint8Array.from(atob(row.body), c => c.charCodeAt(0));
    return new Response(request.method === 'HEAD' ? null : bytes, { headers: { 'Content-Type': row.content_type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } });
  } catch { return new Response(null, { status: 503 }); }
}
