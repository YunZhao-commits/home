/** Legacy public write endpoint is retired; content publishing is admin-only. */
export function onRequest() {
  return Response.json(
    { error: "This endpoint is retired. Public submissions are not accepted." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
