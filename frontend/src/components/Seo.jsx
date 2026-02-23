import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "HI-TECH";
const DEFAULT_TITLE = "HI-TECH Electronics Store";
const DEFAULT_DESCRIPTION =
  "Shop smartphones, accessories, audio devices, and electronics at HI-TECH.";
const DEFAULT_IMAGE = "/images/home-hero.jpeg";
const FALLBACK_SITE_URL = "https://cell.com";

function normalizeSiteUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
}

function toAbsoluteUrl(base, value) {
  if (!value) return base;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${base}${path}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  keywords,
}) {
  const location = useLocation();
  const siteUrl =
    normalizeSiteUrl(import.meta.env.VITE_SITE_URL) ||
    (typeof window !== "undefined"
      ? normalizeSiteUrl(window.location.origin)
      : "") ||
    FALLBACK_SITE_URL;

  const pagePath = canonicalPath || location.pathname || "/";
  const canonicalUrl = toAbsoluteUrl(siteUrl, pagePath);
  const imageUrl = toAbsoluteUrl(siteUrl, image);
  const resolvedTitle = title || DEFAULT_TITLE;
  const fullTitle = resolvedTitle.includes(SITE_NAME)
    ? resolvedTitle
    : `${resolvedTitle} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
