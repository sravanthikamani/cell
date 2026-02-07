import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (data.token) {
      login(data);
      navigate("/");
    } else {
      alert(data.error || t("Login failed"));
    }
  };

  return (
    <div className="max-w-sm mx-auto p-10 card">
      <h1 className="text-2xl font-bold mb-4">{t("Login")}</h1>

      <input
        placeholder={t("Email")}
        className="w-full border p-2 mb-3"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder={t("Password")}
        className="w-full border p-2 mb-3"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={submit}
        className="w-full bg-black text-white py-2"
      >
        {t("Login")}
      </button>
      <button
        onClick={() => navigate("/forgot-password")}
        className="w-full mt-3 text-sm text-blue-600"
      >
        {t("Forgot password?")}
      </button>
      <button
        onClick={() => navigate("/register")}
        className="w-full mt-2 text-sm text-blue-600"
      >
        {t("Create an account")}
      </button>
    </div>
  );
}
