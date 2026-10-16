import { db } from "@/lib/db";
import Card from "@/lib/Card";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [brands, latest, u30] = await Promise.all([db.brand.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 8, include: { brand: true } }),
    db.product.findMany({ where: { published: true, OR: [{ salePrice: { lte: 30000 } }, { salePrice: null, price: { lte: 30000 } }] }, take: 8, include: { brand: true } })]);
  return (<><h1>Buy Mobile Phones Online in Pakistan</h1>
    <h2>Shop by Brand</h2><div className="row">{brands.map(b => <a key={b.id} className="pill" href={`/mobiles?brand=${b.slug}`}>{b.name}</a>)}</div>
    <h2>Latest Mobile Phones</h2><div className="grid">{latest.map(p => <Card key={p.id} p={p} />)}</div>
    <h2>Mobiles Under Rs. 30,000</h2><div className="grid">{u30.map(p => <Card key={p.id} p={p} />)}</div></>);
}
