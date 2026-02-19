const cacheStore = new Map();

function nowMs() {
  return Date.now();
}

function isCacheEnabled() {
  const raw = String(process.env.ENABLE_API_CACHE || "true").toLowerCase();
  return raw !== "false";
}

function buildCacheKey(req, scope = "default") {
  return `${scope}:${req.method}:${req.originalUrl}`;
}

function getCached(key) {
  if (!isCacheEnabled()) return null;
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value, ttlSeconds = 60) {
  if (!isCacheEnabled()) return;
  const ttlMs = Math.max(1, Number(ttlSeconds || 60)) * 1000;
  cacheStore.set(key, {
    value,
    expiresAt: nowMs() + ttlMs,
  });
}

function clearCacheByPrefix(prefix) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

module.exports = {
  buildCacheKey,
  getCached,
  setCached,
  clearCacheByPrefix,
};
