import { handleAction, jsonBody } from '../_lib/manage.js';

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
    if (!checkRateLimit(clientIp)) {
      return Response.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429, headers: corsHeaders }
      );
    }

    try {
      const body = await jsonBody(request);
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

  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized. Please log in." }, { status: 401, headers: corsHeaders });
  }

  if (!env.DB) {
    return Response.json({ error: "Database not bound" }, { status: 500, headers: corsHeaders });
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
