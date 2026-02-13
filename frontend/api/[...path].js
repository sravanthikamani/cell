module.exports = async (req, res) => {
  try {
    const backendBase = (process.env.BACKEND_URL || "").trim();
    if (!backendBase) {
      return res.status(500).json({
        error: "BACKEND_URL is not configured",
      });
    }

    const pathPart = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : req.query.path || "";

    const target = new URL(`/api/${pathPart}`, backendBase);
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === "path") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => target.searchParams.append(key, String(v)));
      } else if (value != null) {
        target.searchParams.set(key, String(value));
      }
    }

    const headers = {};
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }
    if (req.headers["content-type"]) {
      headers["content-type"] = req.headers["content-type"];
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    }

    const upstream = await fetch(target.toString(), init);
    const text = await upstream.text();

    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    const contentDisposition = upstream.headers.get("content-disposition");
    if (contentDisposition) {
      res.setHeader("content-disposition", contentDisposition);
    }

    return res.status(upstream.status).send(text);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Proxy error" });
  }
};
