const COLOR_MAP = {
  black: "#111111",
  white: "#f8fafc",
  silver: "#c0c0c0",
  gray: "#6b7280",
  grey: "#6b7280",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
  gold: "#d4af37",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  brown: "#8b5e3c",
  beige: "#d6c1a6",
  navy: "#1e3a8a",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  olive: "#6b8e23",
};

export function normalizeColorName(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function resolveColorSwatch(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "#94a3b8";

  if (raw.startsWith("#")) return raw;
  if (/^rgb\(/i.test(raw) || /^hsl\(/i.test(raw)) return raw;

  const normalized = normalizeColorName(raw);
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];

  const firstToken = normalized.split(/\s+/)[0];
  if (COLOR_MAP[firstToken]) return COLOR_MAP[firstToken];

  return firstToken || "#94a3b8";
}

export function parseColorImageMapInput(input = "") {
  return String(input || "")
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const [name, ...urlParts] = chunk.split(":");
      const colorName = String(name || "").trim();
      const colorUrl = urlParts.join(":").trim();
      if (colorName && colorUrl) acc[colorName] = colorUrl;
      return acc;
    }, {});
}

export function serializeColorImageMap(value = {}) {
  const entries = Object.entries(value || {});
  return entries.map(([k, v]) => `${k}:${v}`).join(",");
}
