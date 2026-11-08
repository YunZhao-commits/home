/** Convert the old Vue hash URL to a same-origin history URL once. */
export function legacyRouteFromHash(hash) {
  if (typeof hash !== 'string' || !hash.startsWith('#/')) return null;
  const target = hash.slice(1);
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\0')) return null;

  try {
    const url = new URL(target, 'https://same-origin.invalid');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
