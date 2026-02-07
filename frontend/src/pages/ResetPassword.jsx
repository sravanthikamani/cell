import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const submit = async () => {
    setMsg("");
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed to reset password");
      return;
    }
    setMsg("Password reset successful. You can login now.");
    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="max-w-sm mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <input
        type="password"
        placeholder="New Password"
        className="w-full border p-2 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {msg && <div className="text-sm text-gray-700 mb-3">{msg}</div>}
      <button onClick={submit} className="w-full bg-black text-white py-2">
        Reset Password
      </button>
    </div>
  );
}
