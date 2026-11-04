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
        error: "Database not bound",
        is_fallback: true,
        data: [],
      },
      {
        status: 200,
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
        "SELECT * FROM posts WHERE id = ? AND status IN ('published', 'expired')"
      ).bind(postId);
      const post = await stmt.first();

      if (!post) {
        return Response.json({ error: "Post not found" }, { status: 404 });
      }

      // Increment view_count asynchronously
      context.waitUntil(
        env.DB.prepare(
          "UPDATE posts SET view_count = view_count + 1 WHERE id = ?"
        ).bind(postId).run().catch(() => {})
      );

      return Response.json(
        { data: post },
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30, s-maxage=60",
          },
        }
      );
    }

    // 2. Query Public Posts List
    let query = "SELECT id, title, summary, category, link_type, link_url, validity, provider, status, is_featured, created_at, updated_at FROM posts WHERE status IN ('published', 'expired')";
    const params = [];

    if (category && category !== "all") {
      query += " AND category = ?";
      params.push(category);
    }

    if (keyword && keyword.trim()) {
      query += " AND (title LIKE ? OR summary LIKE ?)";
      const pattern = `%${keyword.trim()}%`;
      params.push(pattern, pattern);
    }

    query += " ORDER BY is_featured DESC, updated_at DESC LIMIT 50";

    const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
    const { results } = await stmt.all();

    return Response.json(
      { data: results || [] },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: error.message, is_fallback: true, data: [] },
      { status: 500 }
    );
  }
}
