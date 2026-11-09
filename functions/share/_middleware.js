const SITE_ORIGIN = "https://191607.xyz";
const DEFAULT_TITLE = "精选分享 | Yunchu Studio";
const DEFAULT_DESCRIPTION = "精选实用工具、会员权益与优惠资源，查看内容说明、领取步骤与适用条件。";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (char) => ({
    "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029",
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

function applyMetadata(html, { title, description, url, image, type = "website", noindex = false }) {
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
  if (noindex) result = setMeta(result, "name", "robots", "noindex, nofollow");
  return setCanonical(result, url);
}

function injectAppContent(html, content) {
  const appOpen = /<div\s+id=["']app["'][^>]*>/i.exec(html);
  if (!appOpen) return html;
  const contentStart = appOpen.index + appOpen[0].length;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = contentStart;
  let depth = 1;
  let tag;
  while ((tag = tags.exec(html))) {
    if (/^<\//.test(tag[0])) depth -= 1;
    else if (!/\/\s*>$/.test(tag[0])) depth += 1;
    if (depth === 0) return `${html.slice(0, contentStart)}${content}${html.slice(tag.index)}`;
  }
  return html;
}

function renderBodyText(value) {
  return String(value ?? "").trim().split(/\n\s*\n/).filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br>")}</p>`).join("");
}

function safeExternalHref(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : null;
  } catch { return null; }
}

function renderList(posts) {
  const cards = posts.map((post) => `<li><article><h2><a href="/share/${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h2>
    <p>${escapeHtml(post.summary || "打开查看内容说明与领取方式。")}</p>
    <p><span>${escapeHtml(post.category || "分享")}</span> · <span>${post.status === "expired" ? "已结束" : "正常可用"}</span></p></article></li>`).join("");
  return `<main class="seo-content" aria-label="精选分享内容" style="max-width:1080px;margin:2rem auto;padding:1rem;color:#f4fbff">
    <h1>精选分享</h1><p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>
    ${cards ? `<ul>${cards}</ul>` : `<p>福利正在整理，稍后再来看看。</p>`}</main>`;
}

function renderDetail(post) {
  const statusLabel = post.status === "expired" ? "已结束" : "正常可用";
  const targetHref = safeExternalHref(post.link_url);
  return `<main class="seo-content" style="max-width:1080px;margin:2rem auto;padding:1rem;color:#f4fbff">
    <article><p><a href="/share">返回精选分享</a></p><h1>${escapeHtml(post.title)}</h1>
    ${post.summary ? `<p>${escapeHtml(post.summary)}</p>` : ""}
    <p>分类：${escapeHtml(post.category || "分享")} · 状态：${statusLabel}${post.updated_at ? ` · 更新：${escapeHtml(String(post.updated_at).slice(0, 10))}` : ""}</p>
    <section>${renderBodyText(post.content)}</section>
    ${post.link_type === "invite" && post.disclosure ? `<p>${escapeHtml(post.disclosure)}</p>` : ""}
    ${targetHref ? `<p><a href="${targetHref}" rel="nofollow noopener noreferrer">前往领取</a></p>` : ""}</article></main>`;
}

function notFoundBody() {
  return `<main style="min-height:70vh;display:grid;place-content:center;text-align:center;padding:2rem;color:#effbff;font-family:system-ui,sans-serif">
    <p style="letter-spacing:.2em;color:#80e9e7">404 · PAGE NOT FOUND</p><h1>这个页面暂时找不到</h1>
    <p>链接可能已失效，或页面地址输入有误。</p><p><a style="color:#61e5e4" href="/share">返回精选分享</a>&nbsp; <a style="color:#61e5e4" href="/">回到首页</a></p></main>`;
}

function unavailableBody() {
  return `<main style="min-height:70vh;display:grid;place-content:center;text-align:center;padding:2rem;color:#effbff;font-family:system-ui,sans-serif">
    <p style="letter-spacing:.2em;color:#80e9e7">SHARE · TEMPORARILY UNAVAILABLE</p><h1>精选分享暂时无法加载</h1>
    <p>内容服务正在恢复，请稍后刷新页面。</p><p><a style="color:#61e5e4" href="/">回到首页</a></p></main>`;
}

export async function onRequest(context) {
  const response = await context.next();
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) return response;

  const requestUrl = new URL(context.request.url);
  const segments = requestUrl.pathname.split("/").filter(Boolean);
  const isList = segments.length === 1 && segments[0] === "share";
  const isDetail = segments.length === 2 && segments[0] === "share";
  let metadata = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_ORIGIN}/share`,
    image: `${SITE_ORIGIN}/screenshots/main.jpg`,
  };
  let bodyContent = null;
  let structuredData = null;
  let status = response.status;
  let noindex = false;

  if (isList) {
    if (!context.env.DB) {
      status = 503;
      noindex = true;
      bodyContent = unavailableBody();
    } else {
      try {
        const { results = [] } = await context.env.DB.prepare(
          "SELECT id, title, summary, category, status FROM posts WHERE status IN ('published', 'expired') ORDER BY is_featured DESC, updated_at DESC, id DESC LIMIT 20",
        ).all();
        bodyContent = renderList(results);
      } catch {
        status = 503;
        noindex = true;
        bodyContent = unavailableBody();
      }
    }
  }

  if (isDetail) {
    let id = "";
    try { id = decodeURIComponent(segments[1]); } catch { /* malformed path */ }
    if (id && context.env.DB) {
      try {
        const post = await context.env.DB.prepare(
          "SELECT id, title, summary, content, category, link_type, link_url, disclosure, status, cover_url, created_at, updated_at FROM posts WHERE id = ? AND status IN ('published', 'expired')",
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
          bodyContent = renderDetail(post);
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.summary || post.title,
            datePublished: post.created_at || undefined,
            dateModified: post.updated_at || undefined,
            image: cover,
            mainEntityOfPage: canonical,
            author: { "@type": "Organization", name: "Yunchu Studio" },
          };
        } else {
          status = 404;
          noindex = true;
          bodyContent = notFoundBody();
        }
      } catch {
        status = 503;
        noindex = true;
        bodyContent = unavailableBody();
      }
    } else if (!id) {
      status = 404;
      noindex = true;
      bodyContent = notFoundBody();
    } else {
      status = 503;
      noindex = true;
      bodyContent = unavailableBody();
    }
  }

  let html = await response.text();
  if (bodyContent) html = injectAppContent(html, bodyContent);
  html = applyMetadata(html, { ...metadata, noindex });
  if (structuredData) html = html.replace(/<\/head>/i, `<script type="application/ld+json">${safeJson(structuredData)}</script></head>`);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  headers.set("Cache-Control", status === 404 || status >= 500 ? "no-store" : "public, max-age=0, s-maxage=60");
  if (noindex) headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(html, { status,
    statusText: status === 404 ? "Not Found" : status === 503 ? "Service Unavailable" : response.statusText,
    headers,
  });
}
