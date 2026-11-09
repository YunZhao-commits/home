import { handleAction, jsonBody } from '../_lib/manage.js';

/**
 * Protected Webmaster Admin API
 * Bound to Cloudflare D1 (env.DB)
 *
 * Requirements:
 * - env.ADMIN_PASSWORD (set in Cloudflare Pages Environment Variables)
 * - Optional: Cloudflare Zero Trust / Access header passthrough
 */

const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

async function recordLogin(context, result) {
  if (!context.env.DB) return;
  const req = context.request, cf = req.cf || {};
  const bounded = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
  const ip = bounded(req.headers.get('CF-Connecting-IP'), 64) || '未知';
  try {
    await context.env.DB.prepare(`INSERT OR IGNORE INTO admin_login_logs
      (id, created_at, ip, city, country, user_agent, result, blocked_bucket)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      crypto.randomUUID(), new Date().toISOString(), ip, bounded(cf.city, 120),
      bounded(cf.country, 16), bounded(req.headers.get('User-Agent'), 300), result,
      result === 'blocked' ? Math.floor(Date.now() / 60000) : null,
    ).run();
  } catch { /* Logging failure must not lock the owner out. */ }
}

async function ipFingerprint(ip, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function checkRateLimit(context, ip, secret) {
  const now = Date.now();
  const fingerprint = await ipFingerprint(ip, secret);

  if (context.env.DB) {
    try {
      const record = await context.env.DB.prepare(`
        INSERT INTO admin_login_limits (ip_hash, window_started, attempts)
        VALUES (?, ?, 1)
        ON CONFLICT(ip_hash) DO UPDATE SET
          window_started = CASE
            WHEN admin_login_limits.window_started <= ? THEN excluded.window_started
            ELSE admin_login_limits.window_started
          END,
          attempts = CASE
            WHEN admin_login_limits.window_started <= ? THEN 1
            ELSE admin_login_limits.attempts + 1
          END
        WHERE admin_login_limits.window_started <= ?
          OR admin_login_limits.attempts < ?
        RETURNING attempts
      `).bind(fingerprint, now, now - RATE_LIMIT_WINDOW, now - RATE_LIMIT_WINDOW,
        now - RATE_LIMIT_WINDOW, MAX_ATTEMPTS).first();

      if (record && Math.random() < 0.01 && context.waitUntil) {
        context.waitUntil(
          context.env.DB.prepare("DELETE FROM admin_login_limits WHERE window_started < ?")
            .bind(now - RATE_LIMIT_WINDOW * 2)
            .run()
            .catch(() => {}),
        );
      }
      return { allowed: Boolean(record) && Number(record.attempts) <= MAX_ATTEMPTS, fingerprint, shared: true };
    } catch {
      // If the migration has not been applied yet, keep the login path working
      // with a per-isolate fallback until the D1 table is available.
    }
  }

  const record = loginAttempts.get(fingerprint) || { count: 0, firstAttempt: now };

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(fingerprint, { count: 1, firstAttempt: now });
    return { allowed: true, fingerprint, shared: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, fingerprint, shared: false };
  }

  record.count += 1;
  loginAttempts.set(fingerprint, record);
  return { allowed: true, fingerprint, shared: false };
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
  if (!token || token.split(".").length !== 2) return null;
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
    "Cache-Control": "no-store",
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
    const adminEmail = typeof env.ADMIN_EMAIL === "string" ? env.ADMIN_EMAIL.trim().toLowerCase() : "";
    if (!adminEmail) return Response.json({ error: "管理员邮箱未配置" }, { status: 503, headers: corsHeaders });
    const rateLimit = await checkRateLimit(context, clientIp, adminSecret);
    if (!rateLimit.allowed) {
      await recordLogin(context, 'blocked');
      return Response.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429, headers: corsHeaders }
      );
    }

    try {
      const body = await jsonBody(request);
      const inputEmail = typeof body.email === "string" && body.email.length <= 320 ? body.email.trim().toLowerCase() : "";
      const inputPass = typeof body.password === "string" && body.password.length <= 256 ? body.password : "";

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

      if (!matched || inputEmail !== adminEmail) {
        await recordLogin(context, 'failed');
        return Response.json({ error: "邮箱或密码错误" }, { status: 401, headers: corsHeaders });
      }

      if (rateLimit.shared) {
        await env.DB.prepare("DELETE FROM admin_login_limits WHERE ip_hash = ?")
          .bind(rateLimit.fingerprint)
          .run()
          .catch(() => {});
      }

      const tokenPayload = JSON.stringify({
        role: "admin",
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
      });
      const token = await signToken(tokenPayload, adminSecret);

      await recordLogin(context, 'success');

      return Response.json({ success: true, token }, { headers: corsHeaders });
    } catch (error) {
      return Response.json(
        { error: error.status ? error.message : "登录暂时失败，请稍后重试" },
        { status: error.status || 500, headers: corsHeaders },
      );
    }
  }

  // 2. AUTHENTICATION CHECK FOR ALL OTHER ACTIONS
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const session = await verifyToken(token, adminSecret);

  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized. Please log in." }, { status: 401, headers: corsHeaders });
  }

  if (!env.DB) {
    return Response.json({ error: "Database not bound" }, { status: 500, headers: corsHeaders });
  }

  if (action === 'login-logs') {
    if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
    const page = Math.max(0, Math.min(200, Number.parseInt(url.searchParams.get('page') || '0', 10) || 0));
    const result = url.searchParams.get('result') || '';
    const ip = (url.searchParams.get('ip') || '').trim().slice(0, 64);
    const day = url.searchParams.get('day') || '';
    if ((result && !['success', 'failed', 'blocked'].includes(result)) || (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)))
      return Response.json({ error: '筛选条件无效' }, { status: 400, headers: corsHeaders });
    const clauses = [], params = [];
    if (result) { clauses.push('result = ?'); params.push(result); }
    if (ip) { clauses.push('instr(ip, ?) > 0'); params.push(ip); }
    if (day) { clauses.push('substr(created_at, 1, 10) = ?'); params.push(day); }
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    try {
      const rows = await env.DB.prepare(`SELECT id, created_at, ip, city, country, user_agent, result FROM admin_login_logs${where} ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?`).bind(...params, page * 50).all();
      return Response.json({ data: rows.results.slice(0, 50), hasMore: rows.results.length > 50 }, { headers: corsHeaders });
    } catch { return Response.json({ error: '登录记录暂不可用' }, { status: 503, headers: corsHeaders }); }
  }

  // Every management action uses the same authenticated, origin-checked boundary.
  try {
    const response = await handleAction(context, action || "posts");
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    return Response.json(
      { error: error.status ? error.message : "服务暂时不可用，请稍后重试" },
      { status: error.status || 500, headers: corsHeaders },
    );
  }
}
