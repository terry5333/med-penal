export function requirePanelToken(req: Request) {
  const token = req.headers.get("x-panel-token") || "";
  const expected = process.env.PANEL_TOKEN || "";
  if (!expected || token !== expected) {
    return { ok: false as const, res: new Response("unauthorized", { status: 401 }) };
  }
  return { ok: true as const };
}
