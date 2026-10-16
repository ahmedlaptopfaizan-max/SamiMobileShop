export default function r() { const b = process.env.SITE_URL || "http://localhost:3000";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/order", "/track-order", "/*?"] }, sitemap: b + "/sitemap.xml" }; }
