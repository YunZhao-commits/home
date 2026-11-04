/**
 * Protected Webmaster Admin API
 * Bound to Cloudflare D1 (env.DB)
 *
 * Requirements:
 * - env.ADMIN_PASSWORD (set in Cloudflare Pages Environment Variables)
 * - Optional: Cloudflare Zero Trust / Access header passthrough
 */

// NOTE: In Cloudflare Workers/Pages Functions, this in-memory Map is per-isolate.
// Different global edge POPs / instances do NOT share this memory map.
// It mitigates rapid burst brute-force attacks on the same isolate, but is NOT a global distributed rate limiter.
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count += 1;
  loginAttempts.set(ip, record);
  return true;
}

function isAllowedOrigin(origin, request) {
  if (!origin) return true; // Direct same-origin navigation

  const url = new URL(request.url);
  const host = (request.headers.get("Host") || url.host || "").toLowerCase();

  // 1. 生产环境严格锁定：当请求来自 191607.xyz 时，只允许唯一的生产源 https://191607.xyz
  if (host === "191607.xyz" || host === "www.191607.xyz") {
    return origin === "https://191607.xyz";
  }

  // 2. 本地开发环境：仅允许本地 loopback
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }

  // 3. 独立预览测试：仅当请求直接访问特定 pages.dev 且 Origin 与该域名严格一致时才允许
  if (host.endsWith(".pages.dev") && origin === `https://${host}`) {
    return true;
  }

  return false;
}

// Web Crypto HMAC-SHA256 Token Helper
async function signToken(dataStr, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(dataStr));
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const b64Data = btoa(dataStr);
  return `${b64Data}.${b64Sig}`;
}

async function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [b64Data, b64Sig] = token.split(".");
  try {
    const dataStr = atob(b64Data);
    const data = JSON.parse(dataStr);
    if (!data.exp || data.exp < Date.now()) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(b64Sig), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(dataStr));
    return isValid ? data : null;
  } catch {
    return null;
  }
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = isAllowedOrigin(origin, request);
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "https://191607.xyz",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const corsHeaders = getCorsHeaders(request);

  // Strict CSRF Origin Check for non-GET/OPTIONS requests
  if (origin && !isAllowedOrigin(origin, request)) {
    return Response.json({ error: "Forbidden origin" }, { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const adminSecret = env.ADMIN_PASSWORD;

  if (!adminSecret) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not configured in Cloudflare Pages." },
      { status: 503, headers: corsHeaders }
    );
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // 1. LOGIN HANDLER
  if (request.method === "POST" && action === "login") {
    if (!checkRateLimit(clientIp)) {
      return Response.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json();
      const inputPass = body.password || "";

      // Constant-time comparison
      const encoder = new TextEncoder();
      const a = encoder.encode(inputPass);
      const b = encoder.encode(adminSecret);

      let matched = a.byteLength === b.byteLength;
      if (matched) {
        let diff = 0;
        for (let i = 0; i < a.byteLength; i++) {
          diff |= a[i] ^ b[i];
        }
        matched = diff === 0;
      }

      if (!matched) {
        return Response.json({ error: "Invalid password" }, { status: 401, headers: corsHeaders });
      }

      const tokenPayload = JSON.stringify({
        role: "admin",
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
      });
      const token = await signToken(tokenPayload, adminSecret);

      return Response.json({ success: true, token }, { headers: corsHeaders });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400, headers: corsHeaders });
    }
  }

  // 2. AUTHENTICATION CHECK FOR ALL OTHER ACTIONS
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const session = await verifyToken(token, adminSecret);

  if (!session) {
    return Response.json({ error: "Unauthorized. Please log in." }, { status: 401, headers: corsHeaders });
  }

  if (!env.DB) {
    return Response.json({ error: "Database not bound" }, { status: 500, headers: corsHeaders });
  }

  // 3. ADMIN POSTS CRUD
  try {
    // GET /api/admin?action=posts
    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM posts ORDER BY updated_at DESC"
      ).all();
      return Response.json({ data: results || [] }, { headers: corsHeaders });
    }

    // POST /api/admin?action=posts (Create)
    if (request.method === "POST") {
      const b = await request.json();
      if (!b.title || !b.link_url) {
        return Response.json({ error: "Title and Link URL are required" }, { status: 400, headers: corsHeaders });
      }

      const id = b.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO posts (
          id, title, summary, content, category, link_type, link_url,
          disclosure, validity, provider, status, is_featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        b.title.trim(),
        b.summary ? b.summary.trim() : "",
        b.content ? b.content.trim() : "",
        b.category || "tools",
        b.link_type || "normal",
        b.link_url.trim(),
        b.disclosure ? b.disclosure.trim() : "",
        b.validity || "permanent",
        b.provider ? b.provider.trim() : "",
        b.status || "draft",
        b.is_featured ? 1 : 0,
        now,
        now
      ).run();

      return Response.json({ success: true, id }, { headers: corsHeaders });
    }

    // PUT /api/admin?action=posts (Update / Soft offline)
    if (request.method === "PUT") {
      const b = await request.json();
      if (!b.id) {
        return Response.json({ error: "Post ID is required" }, { status: 400, headers: corsHeaders });
      }

      const now = new Date().toISOString();

      await env.DB.prepare(`
        UPDATE posts SET
          title = COALESCE(?, title),
          summary = COALESCE(?, summary),
          content = COALESCE(?, content),
          category = COALESCE(?, category),
          link_type = COALESCE(?, link_type),
          link_url = COALESCE(?, link_url),
          disclosure = COALESCE(?, disclosure),
          validity = COALESCE(?, validity),
          provider = COALESCE(?, provider),
          status = COALESCE(?, status),
          is_featured = COALESCE(?, is_featured),
          updated_at = ?
        WHERE id = ?
      `).bind(
        b.title !== undefined ? b.title.trim() : null,
        b.summary !== undefined ? b.summary.trim() : null,
        b.content !== undefined ? b.content.trim() : null,
        b.category !== undefined ? b.category : null,
        b.link_type !== undefined ? b.link_type : null,
        b.link_url !== undefined ? b.link_url.trim() : null,
        b.disclosure !== undefined ? b.disclosure.trim() : null,
        b.validity !== undefined ? b.validity : null,
        b.provider !== undefined ? b.provider.trim() : null,
        b.status !== undefined ? b.status : null,
        b.is_featured !== undefined ? (b.is_featured ? 1 : 0) : null,
        now,
        b.id
      ).run();

      return Response.json({ success: true, id: b.id }, { headers: corsHeaders });
    }

    // DELETE /api/admin?action=posts&id=xxx
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) {
        return Response.json({ error: "Post ID is required" }, { status: 400, headers: corsHeaders });
      }

      await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
      return Response.json({ success: true, id }, { headers: corsHeaders });
    }

    return Response.json({ error: "Method not supported" }, { status: 405, headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
