import "./globals.css";
export const metadata = { title: { default: "Mobile Store Pakistan", template: "%s | Mobile Store" }, description: "Buy the latest mobile phones in Pakistan with Cash on Delivery.", metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000") };
export default function L({ children }) { return (<html lang="en"><body>
<header><a href="/" className="logo">📱 Mobile<b>Store</b></a><form action="/mobiles"><input name="q" placeholder="Search phones, brands, storage…" /></form><a href="/cart" className="pill">🛒 Cart</a></header>
<main>{children}</main><footer>© Mobile Store · Cash on Delivery across Pakistan</footer></body></html>); }
