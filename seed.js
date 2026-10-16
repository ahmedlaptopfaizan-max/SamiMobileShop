const { PrismaClient } = require("@prisma/client"); const { PrismaPg } = require("@prisma/adapter-pg"); const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const B = ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Infinix", "Tecno", "Realme", "Motorola", "Honor"];
const P = [["Samsung", "Galaxy A56 (DEMO)", 119999, 109999, 8, 256, 5000, "5G"], ["Apple", "iPhone 16 (DEMO)", 339999, null, 8, 128, 3561, "5G"], ["Xiaomi", "Redmi Note 14 (DEMO)", 54999, 49999, 8, 128, 5500, "4G"], ["Infinix", "Hot 50 (DEMO)", 29999, 26999, 4, 128, 5000, "4G"]];
(async () => { const ids = {}; for (const n of B) ids[n] = (await db.brand.upsert({ where: { name: n }, update: {}, create: { name: n, slug: n.toLowerCase() } })).id;
  for (const [b, name, price, sale, ram, storage, battery, network] of P) { const slug = name.toLowerCase().replace(/ \(demo\)/, "").replace(/[^a-z0-9]+/g, "-");
    await db.product.upsert({ where: { slug }, update: {}, create: { slug, name, brandId: ids[b], price, salePrice: sale, ram, storage, battery, network, stock: 10, colors: ["Black", "Blue"], isDemo: true, description: "Demo listing. Verify price and specifications before publishing." } }); }
  for (const p of await db.product.findMany({ where: { isDemo: true } })) await db.productVariant.upsert({ where: { sku: "D" + p.id }, update: {}, create: { sku: "D" + p.id, productId: p.id, ram: p.ram, storage: p.storage, color: "Black", price: p.price, salePrice: p.salePrice, stock: 10 } });
  console.log("seeded"); })();
