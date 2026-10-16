import { rs, eff } from "./db";
export default function Card({ p }) {
  const off = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  return (<a className="card" href={`/mobiles/${p.brand.slug}/${p.slug}`}><img src={p.images[0] || "/placeholder.svg"} alt={p.name} loading="lazy" />
    <div>{p.name}</div><div className="price">{rs(eff(p))}</div>{off > 0 && <div><span className="old">{rs(p.price)}</span> <span className="badge">-{off}%</span></div>}
    <small>{p.stock > 0 ? "In stock" : "Out of stock"}</small></a>);
}
