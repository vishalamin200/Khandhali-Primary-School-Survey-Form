import { redis, KEY } from "./_db.js";
import { loggedIn } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.RESULTS_PASSWORD) return res.status(503).json({ error: "password-not-configured" });
  if (!loggedIn(req)) return res.status(401).json({ error: "unauthorized" });
  if (!redis) return res.status(503).json({ error: "storage-not-configured" });
  try {
    const all = (await redis.hgetall(KEY)) || {};
    const responses = Object.values(all).map((v) => (typeof v === "string" ? JSON.parse(v) : v));
    return res.status(200).json({ responses });
  } catch (e) {
    return res.status(503).json({ error: "storage-unavailable" });
  }
}
