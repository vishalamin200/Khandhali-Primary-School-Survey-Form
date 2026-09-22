import { redis, KEY } from "./_db.js";

const STDS = ["ધોરણ ૧", "ધોરણ ૨", "ધોરણ ૩", "ધોરણ ૪", "ધોરણ ૫", "ધોરણ ૬", "ધોરણ ૭", "ધોરણ ૮"];
const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

const ALLOWED = {"q1": ["હા", "ના"], "q2": ["સારી", "મધ્યમ", "સુધારાત્મક"], "q3": ["સારું", "મધ્યમ", "સુધારાત્મક"], "q4": ["સારી", "મધ્યમ", "સુધારાત્મક"], "q5": ["હા", "ના"]};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!redis) return res.status(503).json({ error: "storage-not-configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const id = body && typeof body.id === "string" ? body.id : "";
  const a = body && body.answers;
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id) || !a || typeof a !== "object") {
    return res.status(400).json({ error: "invalid" });
  }
  const answers = {};
  for (const [k, opts] of Object.entries(ALLOWED)) {
    if (!opts.includes(a[k])) return res.status(400).json({ error: "invalid-" + k });
    answers[k] = a[k];
  }
  const i = (body && body.info) || {};
  const info = { parent: clean(i.parent), student: clean(i.student), std: clean(i.std) };
  if (!info.parent || info.parent.length > 80) return res.status(400).json({ error: "invalid-parent" });
  if (info.student.length > 80) return res.status(400).json({ error: "invalid-student" });
  if (info.std && !STDS.includes(info.std)) return res.status(400).json({ error: "invalid-std" });
  const at = typeof body.at === "string" && !isNaN(Date.parse(body.at)) ? body.at : new Date().toISOString();
  const record = { id, at, receivedAt: new Date().toISOString(), info, answers };

  try {
    // HSETNX = store only if this id is new, so a retried submission is never counted twice
    await redis.hsetnx(KEY, id, JSON.stringify(record));
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: "storage-unavailable" });
  }
}
