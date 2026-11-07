import { visitorContext, privateJson } from '../_lib/visitor.js';
export function onRequest({ request }) {
  if (request.method !== 'GET') return privateJson({ error: 'Method not allowed' }, 405);
  return privateJson(visitorContext(request));
}
