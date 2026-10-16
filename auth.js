import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { db } from "./db";
import { redirect } from "next/navigation";
const sig = (v) => crypto.createHmac("sha256", process.env.AUTH_SECRET || "").update(v).digest("hex");
export async function login(pw) {
  const ip = (headers().get("x-forwarded-for") || "x").split(",")[0].trim(), since = new Date(Date.now() - 15 * 60e3);
  if (await db.loginAttempt.count({ where: { ip, at: { gte: since } } }) >= 5) return false;
  const a = Buffer.from(pw || ""), b = Buffer.from(process.env.ADMIN_PASSWORD || "\0");
  if (!process.env.AUTH_SECRET || a.length !== b.length || !crypto.timingSafeEqual(a, b)) { await db.loginAttempt.create({ data: { ip } }); return false; }
  const exp = String(Date.now() + 7 * 864e5);
  cookies().set("adm", `${exp}.${sig(exp)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }); return true;
}
export function requireAdmin() {
  const [exp, s] = (cookies().get("adm")?.value || "").split(".");
  if (!exp || !s || Number(exp) < Date.now() || sig(exp) !== s) redirect("/admin/login");
}
export const logout = () => cookies().delete("adm");
