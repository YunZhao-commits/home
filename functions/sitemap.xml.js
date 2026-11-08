const SITE_ORIGIN = "https://191607.xyz";
const STATIC_PATHS = ["/", "/share", "/about", "/notes"];

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function sitemapEntry(path, lastmod) {
  const modified = /^\d{4}-\d{2}-\d{2}$/.test(lastmod || "")
    && !Number.isNaN(Date.parse(`${lastmod}T00:00:00Z`))
    ? `<lastmod>${lastmod}</lastmod>`
    : "";
  return `<url><loc>${xmlEscape(new URL(path, SITE_ORIGIN).href)}</loc>${modified}</url>`;
}

export async function onRequest({ request, env }) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  try {
    const entries = STATIC_PATHS.map((path) => sitemapEntry(path));
    if (env.DB) {
      const { results = [] } = await env.DB.prepare(
        "SELECT id, updated_at FROM posts WHERE status = 'published' ORDER BY updated_at DESC LIMIT 50000",
      ).all();
      for (const post of results) {
        entries.push(sitemapEntry(`/share/${encodeURIComponent(post.id)}`, String(post.updated_at || "").slice(0, 10)));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`;
    return new Response(request.method === "HEAD" ? null : xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
