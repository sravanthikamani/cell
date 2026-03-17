import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rawSiteUrl =
  process.env.VITE_SITE_URL || process.env.SITE_URL || "https://hitechcinisello.it";
const siteUrl = String(rawSiteUrl).trim().replace(/\/+$/, "");
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/products", changefreq: "daily", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/warranty", changefreq: "monthly", priority: "0.6" },
  { loc: "/faq/shipping", changefreq: "monthly", priority: "0.6" },
  { loc: "/faq/product", changefreq: "monthly", priority: "0.6" },
  { loc: "/faq/warranty", changefreq: "monthly", priority: "0.6" } , { loc: "/faq/general", changefreq: "monthly", priority: "0.6" },
  { loc: "/device/smartphones", changefreq: "weekly", priority: "0.8" },
  { loc: "/device/tablets", changefreq: "weekly", priority: "0.8" },
  { loc: "/device/wearables", changefreq: "weekly", priority: "0.8" },
  { loc: "/device/accessories", changefreq: "weekly", priority: "0.8" },
  { loc: "/category/audio", changefreq: "weekly", priority: "0.7" },
  { loc: "/category/chargers", changefreq: "weekly", priority: "0.7" },
  { loc: "/category/cables", changefreq: "weekly", priority: "0.7" },
  { loc: "/category/power-banks", changefreq: "weekly", priority: "0.7" },
];

const toAbsolute = (loc) => `${siteUrl}${loc.startsWith("/") ? loc : `/${loc}`}`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${toAbsolute(url.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const publicDir = path.join(process.cwd(), "public");
await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
await writeFile(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");

console.log(`[seo] Generated sitemap.xml and robots.txt for ${siteUrl}`);
