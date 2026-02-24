const PAYPAL_SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_BASE = "https://api-m.paypal.com";

function getPayPalBaseUrl() {
  const explicit = String(process.env.PAYPAL_API_BASE || "").trim();
  if (explicit) return explicit;
  const mode = String(process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase();
  return mode === "live" ? PAYPAL_LIVE_BASE : PAYPAL_SANDBOX_BASE;
}

function getPayPalCredentials() {
  return {
    clientId: String(process.env.PAYPAL_CLIENT_ID || "").trim(),
    secret: String(process.env.PAYPAL_CLIENT_SECRET || "").trim(),
  };
}

function isPayPalConfigured() {
  const { clientId, secret } = getPayPalCredentials();
  return Boolean(clientId && secret);
}

function getPayPalCurrency() {
  return String(
    process.env.PAYPAL_CURRENCY || process.env.STRIPE_CURRENCY || "EUR"
  ).trim().toUpperCase();
}

async function paypalRequest(path, { method = "GET", token, body } = {}) {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available. Use Node.js 18+.");
  }
  const url = `${getPayPalBaseUrl()}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!response.ok) {
    const reason = data?.message || data?.error_description || data?.name;
    throw new Error(reason || `PayPal request failed (${response.status})`);
  }
  return data;
}

async function getPayPalAccessToken() {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available. Use Node.js 18+.");
  }
  const { clientId, secret } = getPayPalCredentials();
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured.");
  }
  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    const reason = data?.error_description || data?.error || "Unknown PayPal auth error";
    throw new Error(`PayPal auth failed: ${reason}`);
  }
  return data.access_token;
}

async function createPayPalOrder({ total, currency = getPayPalCurrency() }) {
  const safeTotal = Number(total || 0);
  if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
    throw new Error("Invalid PayPal amount");
  }
  const token = await getPayPalAccessToken();
  return paypalRequest("/v2/checkout/orders", {
    method: "POST",
    token,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: String(currency).toUpperCase(),
            value: safeTotal.toFixed(2),
          },
        },
      ],
    },
  });
}

async function capturePayPalOrder(orderId) {
  if (!orderId) throw new Error("PayPal order ID is required");
  const token = await getPayPalAccessToken();
  return paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    token,
    body: {},
  });
}

module.exports = {
  isPayPalConfigured,
  getPayPalCurrency,
  createPayPalOrder,
  capturePayPalOrder,
};

