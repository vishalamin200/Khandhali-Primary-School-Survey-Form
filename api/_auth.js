import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const COOKIE = "svy_session";
export const TEN_DAYS = 10 * 24 * 60 * 60; // seconds

const secret = () => process.env.RESULTS_PASSWORD || "";
const sign = (exp) => createHmac("sha256", secret()).update("results:" + exp).digest("base64url");
const eq = (a, b) => {
  const h = (s) => createHash("sha256").update(String(s)).digest();
  return timingSafeEqual(h(a), h(b));
};

export const passwordOk = (pw) => !!secret() && eq(pw || "", secret());

// Token = expiry + signature. Changing RESULTS_PASSWORD logs everyone out.
export function makeCookie() {
  const exp = Math.floor(Date.now() / 1000) + TEN_DAYS;
  return `${COOKIE}=${exp}.${sign(exp)}; Path=/; Max-Age=${TEN_DAYS}; HttpOnly; Secure; SameSite=Strict`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export function loggedIn(req) {
  if (!secret()) return false;
  const raw = (req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return eq(sig, sign(exp));
}
