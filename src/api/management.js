export async function managementRequest(action, token, { method = 'GET', data, id, file } = {}) {
  const query = new URLSearchParams({ action });
  if (id) query.set('id', id);
  const response = await fetch(`/api/admin?${query}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(data ? { 'Content-Type': 'application/json' } : {}), ...(file ? { 'Content-Type': file.type } : {}) },
    body: file || (data ? JSON.stringify(data) : undefined),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `请求失败（${response.status}）`);
  return result;
}
