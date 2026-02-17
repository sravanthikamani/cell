import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [devVerificationUrl, setDevVerificationUrl] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();

  const submit = async () => {
    setMsg("");
    setDevVerificationUrl("");
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t("Registration failed"));
      return;
    }
    if (data.devVerificationUrl) {
      setDevVerificationUrl(data.devVerificationUrl);
      setMsg("Registration successful. Verify your email using the link below.");
      return;
    }
    setMsg("Registration successful. Please check your email to verify your account.");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="max-w-sm mx-auto p-10 card">
      <h1 className="text-2xl font-bold mb-4">{t("Register")}</h1>

      <input
        placeholder={t("Email")}
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder={t("Password")}
        className="w-full border p-2 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {msg && <div className="text-sm text-gray-700 mb-3">{msg}</div>}
      {devVerificationUrl && (
        <a
          href={devVerificationUrl}
          className="inline-block mb-3 text-sm bg-blue-600 text-white px-3 py-2 rounded"
        >
          Open Verification Link
        </a>
      )}

      <button
        onClick={submit}
        className="w-full bg-black text-white py-2"
      >
        {t("Register")}
      </button>
    </div>
  );
}
