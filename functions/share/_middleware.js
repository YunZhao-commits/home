const SITE_ORIGIN = "https://191607.xyz";
const DEFAULT_TITLE = "精选分享 | Yunchu Studio";
const DEFAULT_DESCRIPTION = "精选实用工具、会员权益与优惠资源，查看内容说明、领取步骤与适用条件。";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function setMeta(html, attribute, key, value) {
  let found = false;
  const next = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const attr = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i"));
    if (attr?.[2]?.toLowerCase() !== key.toLowerCase()) return tag;
    found = true;
    const content = `content="${escapeHtml(value)}"`;
    return /\bcontent\s*=/i.test(tag)
      ? tag.replace(/\bcontent\s*=\s*(["']).*?\1/i, content)
      : tag.replace(/\s*\/?\s*>$/, ` ${content}>`);
  });
  if (found) return next;
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}">`;
  return next.replace(/<\/head>/i, `${tag}</head>`);
}

function setCanonical(html, url) {
  let found = false;
  const next = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = tag.match(/\brel\s*=\s*(["'])(.*?)\1/i);
    if (rel?.[2]?.toLowerCase() !== "canonical") return tag;
    found = true;
    return tag.replace(/\bhref\s*=\s*(["']).*?\1/i, `href="${escapeHtml(url)}"`);
  });
  return found ? next : next.replace(/<\/head>/i, `<link rel="canonical" href="${escapeHtml(url)}"></head>`);
}

function applyMetadata(html, { title, description, url, image, type = "website" }) {
  let result = html.replace(/<title\b[^>]*>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);
  if (!/<title\b/i.test(result)) result = result.replace(/<\/head>/i, `<title>${escapeHtml(title)}</title></head>`);
  result = setMeta(result, "name", "description", description);
  result = setMeta(result, "property", "og:title", title);
  result = setMeta(result, "property", "og:description", description);
  result = setMeta(result, "property", "og:url", url);
  result = setMeta(result, "property", "og:type", type);
  result = setMeta(result, "property", "og:image", image);
  result = setMeta(result, "name", "twitter:title", title);
  result = setMeta(result, "name", "twitter:description", description);
  result = setMeta(result, "name", "twitter:image", image);
  result = setMeta(result, "name", "twitter:card", "summary_large_image");
  return setCanonical(result, url);
}

export async function onRequest(context) {
  const response = await context.next();
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) return response;

  const requestUrl = new URL(context.request.url);
  const segments = requestUrl.pathname.split("/").filter(Boolean);
  const isDetail = segments.length === 2 && segments[0] === "share";
  let metadata = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_ORIGIN}/share`,
    image: `${SITE_ORIGIN}/screenshots/main.jpg`,
  };

  if (isDetail && context.env.DB) {
    let id = "";
    try { id = decodeURIComponent(segments[1]); } catch { /* malformed path: leave generic metadata */ }
    if (id) {
      try {
        const post = await context.env.DB.prepare(
          "SELECT id, title, summary, cover_url FROM posts WHERE id = ? AND status IN ('published', 'expired')",
        ).bind(id).first();
        if (post) {
          const canonical = `${SITE_ORIGIN}/share/${encodeURIComponent(post.id)}`;
          const cover = /^\/api\/media\?id=[a-f0-9]{64}$/.test(post.cover_url || "")
            ? new URL(post.cover_url, SITE_ORIGIN).href
            : `${SITE_ORIGIN}/screenshots/main.jpg`;
          metadata = {
            title: `${post.title} | Yunchu Studio 精选分享`,
            description: (post.summary || post.title).slice(0, 300),
            url: canonical,
            image: cover,
            type: "article",
          };
        }
      } catch { /* SEO enrichment must never make the page unavailable. */ }
    }
  }

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  headers.set("Cache-Control", "public, max-age=0, s-maxage=60");
  return new Response(applyMetadata(html, metadata), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
