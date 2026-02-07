import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();

  const submit = async () => {
    setMsg("");
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t("Registration failed"));
      return;
    }
    setMsg(t("Registration successful. You can login now."));
    setTimeout(() => navigate("/login"), 800);
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

      <button
        onClick={submit}
        className="w-full bg-black text-white py-2"
      >
        {t("Register")}
      </button>
    </div>
  );
}
