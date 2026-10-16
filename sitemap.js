import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function s() { const b = process.env.SITE_URL || "http://localhost:3000";
  const [ps, bs] = await Promise.all([db.product.findMany({ where: { published: true }, include: { brand: true } }), db.brand.findMany({ where: { products: { some: { published: true } } } })]);
  return [{ url: b }, { url: b + "/mobiles" }, ...["30000", "50000", "100000"].map(x => ({ url: `${b}/mobiles/under-${x}` })), ...bs.map(x => ({ url: `${b}/mobiles/${x.slug}` })), ...ps.map(p => ({ url: `${b}/mobiles/${p.brand.slug}/${p.slug}`, lastModified: p.createdAt }))]; }
