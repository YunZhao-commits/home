/**
 * Public Read-Only API for Curated Sharing Posts
 * Bound to Cloudflare D1 (env.DB)
 *
 * GET /api/posts - list all published/expired posts (supports ?category=xxx&keyword=xxx)
 * GET /api/posts?id=xxx - get single post details
 */

export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const postId = url.searchParams.get("id");
  const category = url.searchParams.get("category");
  const keyword = url.searchParams.get("keyword");

  // Fallback if D1 is not bound
  if (!env.DB) {
    return Response.json(
      {
        error: "精选分享暂时不可用，请稍后重试",
      },
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    // 1. Single Post Detail
    if (postId) {
      const stmt = env.DB.prepare(
        "SELECT id, title, summary, content, category, link_type, link_url, disclosure, validity, provider, status, is_featured, cover_url, created_at, updated_at FROM posts WHERE id = ? AND status IN ('published', 'expired')"
      ).bind(postId);
      const post = await stmt.first();

      if (!post) {
        return Response.json({ error: "Post not found" }, { status: 404 });
      }

      return Response.json(
        { data: post },
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // 2. Query Public Posts List
    let query = "SELECT id, title, summary, category, link_type, link_url, disclosure, cover_url, validity, provider, status, is_featured, created_at, updated_at FROM posts WHERE status IN ('published', 'expired')";
    const params = [];

    if (category && category !== "all") {
      query += " AND category = ?";
      params.push(category);
    }

    if (keyword && keyword.trim()) {
      query += " AND (title LIKE ? OR summary LIKE ?)";
      const term = Array.from(keyword.trim()).slice(0, 10).join("");
      const pattern = `%${term}%`;
      params.push(pattern, pattern);
    }

    const countQuery = query.replace(/^SELECT .*? FROM posts/, "SELECT COUNT(*) AS total FROM posts");
    const count = await env.DB.prepare(countQuery).bind(...params).first();
    const page = Math.min(10000, Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
    const limit = 20;
    query += " ORDER BY is_featured DESC, updated_at DESC, id DESC LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
    const { results } = await stmt.all();

    return Response.json(
      { data: results || [], total: count.total, page },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return Response.json(
      { error: "精选分享暂时不可用，请稍后重试" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
