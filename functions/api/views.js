export function onRequest() {
  return Response.json(
    { error: "Visitor view counting is disabled." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
