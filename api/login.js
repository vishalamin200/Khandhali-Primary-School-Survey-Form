import { passwordOk, makeCookie } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!process.env.RESULTS_PASSWORD) return res.status(503).json({ error: "password-not-configured" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!passwordOk(body && body.password)) {
    await new Promise((r) => setTimeout(r, 700)); // slows down password guessing
    return res.status(401).json({ error: "unauthorized" });
  }
  res.setHeader("Set-Cookie", makeCookie());
  return res.status(200).json({ ok: true });
}
