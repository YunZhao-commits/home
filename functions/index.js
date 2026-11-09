// Route the home document through the root metadata middleware while leaving
// Pages' static-asset response behavior intact.
export function onRequest(context) {
  return context.next();
}
