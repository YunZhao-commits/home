/**
 * Fetch public posts list from /api/posts
 * Strictly queries API, returns real data or empty state/error; never contains mock posts.
 */
export async function getPublicPosts(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "all") {
      searchParams.set("category", params.category);
    }
    if (params.keyword && params.keyword.trim()) {
      searchParams.set("keyword", params.keyword.trim());
    }

    if (params.page) searchParams.set("page", String(params.page));
    const queryStr = searchParams.toString();
    const res = await fetch(`/api/posts${queryStr ? `?${queryStr}` : ""}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return { list: data.data, total: data.total, error: null };
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      return { list: [], error: errJson.error || "获取精选分享失败，请稍后刷新" };
    }
  } catch (err) {
    return { list: [], error: "网络连接失败，请检查网络后刷新" };
  }

  return { list: [], error: null };
}

/**
 * Fetch single post details by id
 */
export async function getPostDetail(id) {
  try {
    const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

/**
 * Admin API Client (Stationmaster only)
 */
export async function adminLogin(password) {
  const res = await fetch("/api/admin?action=login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { token: null, error: data.error || `登录校验未通过 (HTTP ${res.status})` };
  }
  return data;
}

export async function adminGetPosts(token) {
  const res = await fetch("/api/admin?action=posts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: [], status: res.status, error: data.error || `获取后台数据失败 (HTTP ${res.status})` };
  }
  return data;
}

export async function adminSavePost(postData, token, isEdit = false) {
  const res = await fetch("/api/admin?action=posts", {
    method: isEdit ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: data.error || `保存失败 (HTTP ${res.status})` };
  }
  return data;
}

export async function adminDeletePost(id, token) {
  const res = await fetch(`/api/admin?action=posts&id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: data.error || `删除失败 (HTTP ${res.status})` };
  }
  return data;
}
