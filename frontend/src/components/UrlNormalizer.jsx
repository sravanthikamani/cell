import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function UrlNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    let normalizedPath = pathname.replace(/\/{2,}/g, "/");

    if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    if (normalizedPath === pathname) return;

    navigate(`${normalizedPath}${search}${hash}`, { replace: true });
  }, [location, navigate]);

  return null;
}
