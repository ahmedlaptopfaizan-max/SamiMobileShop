// SQL-level test of the same atomic patterns used in app/api/order/route.js and lib/orders.js (does NOT run the Next.js app)
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 25 });
(async () => {
  await pool.query(`INSERT INTO "Brand"(name,slug) VALUES('T','t') ON CONFLICT DO NOTHING`);
  const b = (await pool.query(`SELECT id FROM "Brand" WHERE slug='t'`)).rows[0].id;
  const p = (await pool.query(`INSERT INTO "Product"(slug,name,"brandId",price,ram,storage,battery,stock) VALUES('t'||random(),'T',$1,100,4,64,1,3) RETURNING id`, [b])).rows[0].id;
  const v = (await pool.query(`INSERT INTO "ProductVariant"("productId",sku,ram,storage,price,stock) VALUES($1,'S'||random(),4,64,100,3) RETURNING id`, [p])).rows[0].id;
  const buy = async () => { const c = await pool.connect(); try { await c.query("BEGIN"); const r = await c.query(`UPDATE "ProductVariant" SET stock=stock-1 WHERE id=$1 AND stock>=1`, [v]); if (r.rowCount !== 1) throw 0; await c.query("COMMIT"); return 1; } catch { await c.query("ROLLBACK"); return 0; } finally { c.release(); } };
  const ok = (await Promise.all(Array.from({ length: 20 }, buy))).reduce((a, x) => a + x, 0);
  const st = (await pool.query(`SELECT stock FROM "ProductVariant" WHERE id=$1`, [v])).rows[0].stock;
  console.log(`oversell test: 20 buyers, stock 3 -> successes=${ok}, final stock=${st}`, ok === 3 && st === 0 ? "PASS" : "FAIL");
  const o = (await pool.query(`INSERT INTO "Order"("idemKey",name,phone,province,city,address,subtotal,delivery,total) VALUES('k'||random(),'a','b','c','d','e',1,1,2) RETURNING id`)).rows[0].id;
  const cancel = async () => { const c = await pool.connect(); try { await c.query("BEGIN"); const r = await c.query(`UPDATE "Order" SET status='Cancelled' WHERE id=$1 AND status<>'Cancelled'`, [o]); if (r.rowCount === 1) await c.query(`UPDATE "ProductVariant" SET stock=stock+1 WHERE id=$1`, [v]); await c.query("COMMIT"); return r.rowCount; } finally { c.release(); } };
  const n = (await Promise.all(Array.from({ length: 10 }, cancel))).reduce((a, x) => a + x, 0);
  const st2 = (await pool.query(`SELECT stock FROM "ProductVariant" WHERE id=$1`, [v])).rows[0].stock;
  console.log(`cancel test: 10 concurrent cancels -> restored=${n}x, stock=${st2}`, n === 1 && st2 === 1 ? "PASS" : "FAIL");
  const neg = await pool.query(`UPDATE "ProductVariant" SET stock=-1 WHERE id=$1`, [v]).then(() => "no", () => "blocked");
  console.log("negative stock constraint:", neg); await pool.end();
})();
