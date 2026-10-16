"use server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { db } from "./db";
import { requireAdmin } from "./auth";
import { sendOrderMail } from "./mail";
import { setOrderStatus } from "./orders";
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export async function saveProduct(f) {
  requireAdmin();
  const id = Number(f.get("id") || 0), n = (k) => Number(f.get(k) || 0), s = (k) => String(f.get(k) || "").trim();
  let images = s("keepImages") ? s("keepImages").split("\n").filter(Boolean) : [];
  for (const file of f.getAll("files")) if (file.size > 0) {
    if (!/^image\//.test(file.type) || file.size > 4e6) throw new Error("Images only, max 4MB each");
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Set BLOB_READ_WRITE_TOKEN to upload images");
    images.push((await put(`products/${Date.now()}-${file.name}`, file, { access: "public" })).url);
  }
  let brandId = n("brandId");
  if (s("newBrand")) { const nb = s("newBrand"); brandId = (await db.brand.upsert({ where: { slug: slugify(nb) }, update: {}, create: { name: nb, slug: slugify(nb) } })).id; }
  const data = { name: s("name"), brandId, price: n("price"), salePrice: n("salePrice") || null, ram: n("ram"), storage: n("storage"), battery: n("battery"), camera: s("camera"),
    network: s("network") || "4G", pta: f.get("pta") === "on", stock: n("stock"), colors: s("colors").split(",").map(x => x.trim()).filter(Boolean), images, description: s("description"), published: f.get("published") === "on", isDemo: false };
  if (!data.name || !brandId || !data.price) throw new Error("Name, brand and price are required");
  const vs = s("variants").split("\n").map(l => l.split(",").map(x => x.trim())).filter(a => a.length >= 6 && a[0]).map(a => ({ ram: +a[0], storage: +a[1], color: a[2], price: +a[3], salePrice: +a[4] || null, stock: Math.max(0, +a[5] || 0), sku: a[6] || slugify(`${data.name}-${a[0]}-${a[1]}-${a[2]}`) }));
  if (!vs.length || vs.some(v => !(v.price > 0) || !(v.ram > 0) || !(v.storage > 0))) throw new Error("Add at least one valid variant: ram,storage,colour,price,salePrice,stock,sku");
  const m = vs.reduce((a, v) => ((v.salePrice || v.price) < (a.salePrice || a.price) ? v : a));
  Object.assign(data, { price: m.price, salePrice: m.salePrice, ram: m.ram, storage: m.storage, stock: vs.reduce((a, v) => a + v.stock, 0), colors: [...new Set(vs.map(v => v.color).filter(Boolean))] });
  let pid = id;
  if (id) await db.product.update({ where: { id }, data });
  else { let slug = slugify(data.name); if (await db.product.findUnique({ where: { slug } })) slug += "-" + Date.now().toString(36); pid = (await db.product.create({ data: { ...data, slug } })).id; }
  for (const v of vs) await db.productVariant.upsert({ where: { sku: v.sku }, update: { ...v, productId: pid }, create: { ...v, productId: pid } });
  await db.productVariant.deleteMany({ where: { productId: pid, sku: { notIn: vs.map(v => v.sku) } } });
  revalidatePath("/", "layout"); redirect("/admin/products");
}
export async function removeProduct(f) { requireAdmin(); await db.product.delete({ where: { id: Number(f.get("id")) } }); revalidatePath("/", "layout"); }
export async function setStatus(f) { requireAdmin(); await setOrderStatus(Number(f.get("id")), String(f.get("status"))); revalidatePath("/admin"); }
export async function retryEmail(f) { requireAdmin(); const o = await db.order.findUnique({ where: { id: Number(f.get("id")) }, include: { items: true } });
  try { await sendOrderMail(o); await db.order.update({ where: { id: o.id }, data: { emailSent: true, emailError: null } }); } catch (e) { await db.order.update({ where: { id: o.id }, data: { emailError: String(e.message).slice(0, 300) } }); } revalidatePath("/admin"); }
export async function testEmail() { requireAdmin();
  try { await nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } }).sendMail({ from: process.env.GMAIL_USER, to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER, subject: "Test email — Mobile Store", text: "Email settings work." }); redirect("/admin?mail=ok"); }
  catch (e) { if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e; redirect("/admin?mail=fail"); } }
