import { useState } from "react";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const { t } = useI18n();

  const submit = async () => {
    setMsg("");
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t("Failed to send reset email"));
      return;
    }
    setMsg(t("If the email exists, a reset link was sent."));
  };

  return (
    <div className="max-w-sm mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">{t("Forgot Password")}</h1>
      <input
        placeholder={t("Email")}
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {msg && <div className="text-sm text-gray-700 mb-3">{msg}</div>}
      <button onClick={submit} className="w-full bg-black text-white py-2">
        {t("Send Reset Link")}
      </button>
    </div>
  );
}
