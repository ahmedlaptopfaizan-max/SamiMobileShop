import { db } from "./db";
import { saveProduct } from "./actions";
export default async function ProductForm({ p }) { const brands = await db.brand.findMany({ orderBy: { name: "asc" } }); const v = (k, d = "") => p?.[k] ?? d;
  return (<form action={saveProduct} className="f" style={{ maxWidth: 560 }}><input type="hidden" name="id" value={v("id", "")} /><input type="hidden" name="keepImages" value={(p?.images || []).join("\n")} />
    <input name="name" placeholder="Product name e.g. Samsung Galaxy A56" defaultValue={v("name")} required />
    <select name="brandId" defaultValue={v("brandId")}><option value="">Select brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><input name="newBrand" placeholder="…or new brand name" />
    <input name="price" type="number" placeholder="Price (Rs.)" defaultValue={v("price")} required /><input name="salePrice" type="number" placeholder="Discount price (optional)" defaultValue={v("salePrice", "")} />
    <input name="ram" type="number" placeholder="RAM GB" defaultValue={v("ram")} /><input name="storage" type="number" placeholder="Storage GB" defaultValue={v("storage")} /><input name="battery" type="number" placeholder="Battery mAh" defaultValue={v("battery")} />
    <input name="camera" placeholder="Camera e.g. 50MP + 12MP" defaultValue={v("camera")} /><select name="network" defaultValue={v("network", "4G")}><option>4G</option><option>5G</option></select>
    <input name="colors" placeholder="Colours: Black, Blue" defaultValue={(p?.colors || []).join(", ")} /><input name="stock" type="number" placeholder="Stock" defaultValue={v("stock", 0)} />
    <textarea name="variants" rows="5" placeholder="One variant per line: ram,storage,colour,price,salePrice,stock,sku&#10;8,256,Black,119999,109999,10,A56-8-256-BLK" defaultValue={(p?.variants || []).map(v => [v.ram, v.storage, v.color, v.price, v.salePrice || "", v.stock, v.sku].join(",")).join("\n")} />
    <textarea name="description" rows="5" placeholder="Description" defaultValue={v("description")} />
    <label><input type="checkbox" name="pta" defaultChecked={v("pta", true)} style={{ width: "auto" }} /> PTA approved</label>
    <label><input type="checkbox" name="published" defaultChecked={v("published", true)} style={{ width: "auto" }} /> Published</label>
    {p?.images?.map(i => <img key={i} src={i} width="60" alt="" />)}<input type="file" name="files" accept="image/*" multiple />
    <button className="btn">Save &amp; Publish</button></form>); }
