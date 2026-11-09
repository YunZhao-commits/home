const SITE_ORIGIN = "https://191607.xyz";
const PAGE_METADATA = {
  "/": {
    title: "Yunchu Studio | 云初工作室",
    description: "整理、筛选并分享日常发现的实用工具、会员权益与优质资源。",
    canonical: `${SITE_ORIGIN}/`,
  },
  "/about": {
    title: "关于本站 | Yunchu Studio",
    description: "了解 Yunchu Studio 的内容整理原则、推广说明、时间天气隐私规则与联系方式。",
    canonical: `${SITE_ORIGIN}/about`,
  },
  "/notes": {
    title: "笔记与记录 | Yunchu Studio",
    description: "Yunchu Studio 的个人笔记、整理记录与持续更新的内容。",
    canonical: `${SITE_ORIGIN}/notes`,
  },
  "/admin": {
    title: "站长管理终端 | Yunchu Studio",
    description: "Yunchu Studio 内容管理入口。",
    canonical: `${SITE_ORIGIN}/admin`,
    noindex: true,
  },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function setMeta(html, attribute, key, value) {
  let found = false;
  const next = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i"));
    if (match?.[2]?.toLowerCase() !== key.toLowerCase()) return tag;
    found = true;
    return tag.replace(/\bcontent\s*=\s*(["']).*?\1/i, `content="${escapeHtml(value)}"`);
  });
  return found ? next : next.replace(/<\/head>/i, `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}"></head>`);
}

function applyPageMetadata(html, metadata) {
  let result = html.replace(/<title\b[^>]*>.*?<\/title>/is, `<title>${escapeHtml(metadata.title)}</title>`);
  result = setMeta(result, "name", "description", metadata.description);
  result = setMeta(result, "property", "og:title", metadata.title);
  result = setMeta(result, "property", "og:description", metadata.description);
  result = setMeta(result, "property", "og:url", metadata.canonical);
  result = setMeta(result, "name", "twitter:title", metadata.title);
  result = setMeta(result, "name", "twitter:description", metadata.description);
  let foundCanonical = false;
  result = result.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = tag.match(/\brel\s*=\s*(["'])(.*?)\1/i);
    if (rel?.[2]?.toLowerCase() !== "canonical") return tag;
    foundCanonical = true;
    return tag.replace(/\bhref\s*=\s*(["']).*?\1/i, `href="${escapeHtml(metadata.canonical)}"`);
  });
  if (!foundCanonical) result = result.replace(/<\/head>/i, `<link rel="canonical" href="${escapeHtml(metadata.canonical)}"></head>`);
  if (metadata.noindex) result = setMeta(result, "name", "robots", "noindex, nofollow");
  return result;
}

export async function onRequest(context) {
  const response = await context.next();
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) return response;
  const pathname = new URL(context.request.url).pathname.replace(/\/+$/, "") || "/";
  const metadata = PAGE_METADATA[pathname];
  if (!metadata) return response;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  headers.set("Cache-Control", metadata.noindex ? "private, no-store" : "public, max-age=0, s-maxage=60");
  if (metadata.noindex) headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(applyPageMetadata(await response.text(), metadata), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
