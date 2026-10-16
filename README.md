# Mobile Store PK (production candidate — see 'Not yet built')

## Roman Urdu Setup Guide
1. **GitHub:** github.com par new repository banayein, phir is folder ko upload karein (`.env` kabhi upload na karein).
2. **Database:** neon.tech par free PostgreSQL banayein, `DATABASE_URL` copy karein.
3. **Vercel:** vercel.com > Add New Project > apni GitHub repo import karein.
4. **Environment variables** (Vercel > Settings > Environment Variables), `.env.example` dekhein:
   DATABASE_URL, GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_EMAIL, DELIVERY_FEE, SITE_URL, AUTH_SECRET, ADMIN_PASSWORD, BLOB_READ_WRITE_TOKEN.
5. **Gmail:** Google Account > Security > 2-Step Verification ON > App Passwords se 16-digit password banayein > GMAIL_APP_PASSWORD mein daalein.
6. **Images:** Vercel > Storage > Blob banayein; token BLOB_READ_WRITE_TOKEN mein aa jata hai.
7. **Tables banane ke liye (sirf aik dafa, apne computer par):** `npm install`, DATABASE_URL set karke `npx prisma db push`, phir `npm run seed`.
8. **Admin:** `/admin/login` par ADMIN_PASSWORD se login. AUTH_SECRET lamba random text rakhein.
9. **Pehla phone:** Admin > + New Product > form bharein > Save & Publish. Demo phones Products list se delete karein.
10. **Test:** Admin > Send Test Email dabayein, phir aik test order dein aur email check karein.

## Deploy checklist (English)
Vercel > Build Command: `npm run migrate && npm run build` ; set env vars from `.env.example`. First time: `npm run seed` locally.
Admin variants format (one per line): `ram,storage,colour,price,salePrice,stock,sku`.

## Verified in sandbox
Migration SQL applied to real PostgreSQL; SQL-level tests (`node scripts-sqltest.cjs`) of atomic stock decrement and single-restore cancel.
## NOT verified (need your environment)
`prisma generate`/`migrate deploy`, `npm ci` + production build, API checkout, admin login, Blob upload, Gmail.
## Not built
Categories, banners, blog, SEO-settings pages, /latest-mobiles, /mobile-deals, /best-selling-mobiles.
