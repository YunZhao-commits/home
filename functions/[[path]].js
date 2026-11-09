const APP_PATHS = new Set(["/share", "/notes", "/about", "/admin"]);

function notFoundPage() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>页面不存在 | Yunchu Studio</title><style>
    :root{color-scheme:dark;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#062b3b;color:#effbff}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 35%,#135970 0,#082f42 48%,#031c2a 100%)}main{width:min(92vw,620px);padding:clamp(28px,7vw,64px);text-align:center;border:1px solid #70d8e477;border-radius:24px;background:#062f40b8;box-shadow:0 24px 80px #00151c80;backdrop-filter:blur(18px)}.eyebrow{color:#77e9e8;letter-spacing:.2em;font-size:.8rem}h1{margin:12px 0;font-size:clamp(2rem,7vw,3rem)}p{color:#c7dbe3;line-height:1.8}nav{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:28px}a{padding:11px 18px;color:#eaffff;text-decoration:none;border:1px solid #67d9e4aa;border-radius:999px}a:hover{background:#18c8c7;color:#032a39}</style></head><body><main><p class="eyebrow">404 · PAGE NOT FOUND</p><h1>这个页面暂时找不到</h1><p>链接可能已失效，或页面地址输入有误。</p><nav><a href="/share">返回精选分享</a><a href="/">回到首页</a></nav></main></body></html>`;
}

export async function onRequest(context) {
  const response = await context.next();
  if (response.status !== 200 || !response.headers.get("content-type")?.toLowerCase().includes("text/html")) return response;

  const pathname = new URL(context.request.url).pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/" || APP_PATHS.has(pathname)) return response;

  // Share URLs are validated against D1 by functions/share/_middleware.js.
  if (/^\/share\/[^/]+$/.test(pathname)) return response;

  return new Response(notFoundPage(), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
