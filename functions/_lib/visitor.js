import { validTimeZone } from '../../shared/visitor-time.js';
export function visitorContext(request) {
  const cf = request.cf || {};
  const clean = value => typeof value === 'string' ? value.slice(0, 120) : '';
  return { timeZone: validTimeZone(cf.timezone) ? cf.timezone : null,
    location: { city: clean(cf.city), region: clean(cf.region), country: clean(cf.country) },
    source: 'network-ip', serverTime: Date.now() };
}
export function privateJson(data, status = 200) {
  return Response.json(data, { status, headers: {
    'Cache-Control': 'private, no-store, max-age=0', 'CDN-Cache-Control':'no-store',
    'X-Content-Type-Options': 'nosniff', 'Permissions-Policy': 'geolocation=()',
  } });
}
