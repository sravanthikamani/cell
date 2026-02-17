import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Verifying your email...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const run = async () => {
      const email = (searchParams.get("email") || "").trim();
      const token = (searchParams.get("token") || "").trim();

      if (!email || !token) {
        setMsg("Invalid verification link.");
        setDone(true);
        return;
      }

      try {
        const url = `${API_BASE}/api/auth/verify-email?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(token)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          setMsg(data.error || "Email verification failed.");
          setDone(true);
          return;
        }

        setMsg("Email verified successfully. You can login now.");
        setDone(true);
        setTimeout(() => navigate("/login"), 1200);
      } catch (_err) {
        setMsg("Email verification failed.");
        setDone(true);
      }
    };

    run();
  }, [navigate, searchParams]);

  return (
    <div className="max-w-sm mx-auto p-10 card">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      <div className="text-sm text-gray-700 mb-4">{msg}</div>
      {done && (
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-black text-white py-2"
        >
          Go to Login
        </button>
      )}
    </div>
  );
}
