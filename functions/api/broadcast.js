/**
 * Rate-limited broadcast API proxy.
 *
 * Replaces direct Supabase client access from the browser.
 * Reads from Supabase using the public anon key.
 * Writes are validated and rate-limited before forwarding.
 *
 * Required Cloudflare Pages secrets:
 *   SUPABASE_URL  — e.g. https://xxxxx.supabase.co
 *   SUPABASE_ANON_KEY — public anon key (used server-side only, never sent to browser)
 */

// Simple in-memory rate limiter (resets on cold start; acceptable for personal site)
const rateMap = new Map();
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_WRITES_PER_WINDOW = 5;
const MAX_CONTENT_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 30;

let lastCleanup = Date.now();

function rateLimit(ip) {
  const now = Date.now();
  // Lazy cleanup: purge stale entries inline (Cloudflare Workers forbid global setInterval)
  if (now - lastCleanup > RATE_WINDOW_MS * 2) {
    lastCleanup = now;
    for (const [key, entry] of rateMap) {
      if (now - entry.windowStart > RATE_WINDOW_MS * 2) rateMap.delete(key);
    }
  }
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_WRITES_PER_WINDOW) return false;
  entry.count++;
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://191607.xyz',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow same-origin
  const origin = request.headers.get('Origin');
  if (origin && origin !== 'https://191607.xyz') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Not configured' }, { status: 503 });
  }

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  try {
    if (request.method === 'GET') {
      // Read latest broadcasts
      const res = await fetch(
        `${supabaseUrl}/rest/v1/broadcasts?select=*&order=created_at.desc&limit=10`,
        { headers }
      );
      const data = await res.json();
      return Response.json(data, {
        headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' },
      });
    }

    if (request.method === 'POST') {
      // Rate limit check
      if (!rateLimit(ip)) {
        return Response.json(
          { error: 'Too many messages. Please wait a moment.' },
          { status: 429, headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } }
        );
      }

      const body = await request.json();
      const content = String(body.content || '').trim();
      const author = String(body.author || 'Anonymous').trim();

      // Input validation
      if (!content) {
        return Response.json({ error: 'Content is required' }, { status: 400,
          headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } });
      }
      if (content.length > MAX_CONTENT_LENGTH) {
        return Response.json(
          { error: `Content too long (max ${MAX_CONTENT_LENGTH} chars)` },
          { status: 400, headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } }
        );
      }
      if (author.length > MAX_AUTHOR_LENGTH) {
        return Response.json(
          { error: `Author name too long (max ${MAX_AUTHOR_LENGTH} chars)` },
          { status: 400, headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } }
        );
      }

      // Insert via Supabase REST API (server-side, key never exposed to browser)
      const res = await fetch(
        `${supabaseUrl}/rest/v1/broadcasts`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ author, content }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Database error: ${err}` }, { status: 502,
          headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } });
      }

      return Response.json({ ok: true }, {
        headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' },
      });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405,
      headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } });
  } catch (err) {
    return Response.json({ error: 'Internal error' }, { status: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://191607.xyz' } });
  }
}
