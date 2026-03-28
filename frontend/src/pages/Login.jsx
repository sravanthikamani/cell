import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const googleBtnRef = useRef(null);
  const googleInitRef = useRef(false);

  // Only initialize Google once per page load
  const renderGoogleButton = () => {
    if (!googleClientId || !googleBtnRef.current || !window.google?.accounts?.id) return;
    if (googleInitRef.current) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async ({ credential }) => {
        if (!credential) return;
        const ok = await socialLogin("google", { credential });
        if (!ok) {
          // Optionally, you can re-render the button here if needed
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
    googleInitRef.current = true;
    setGoogleReady(true);
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/google/config`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Google login is not configured");
        return data;
      })
      .then((data) => setGoogleClientId(String(data.clientId || "").trim()))
      .catch((err) => {
        console.error("Google config load failed:", err.message);
        setGoogleClientId("");
        setGoogleReady(false);
      });
  }, []);

  const socialLogin = async (provider, payload) => {
    setSocialLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/social/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `${provider} login failed`);
        return false;
      }
      login(data);
      window.location.assign("/");
      return true;
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      alert(err.message || `${provider} login failed`);
      return false;
    } finally {
      setSocialLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;

    // Only add the script if it doesn't exist
    if (!window.google?.accounts?.id) {
      const existing = document.querySelector("script[data-google-gsi]");
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.googleGsi = "true";
        script.onload = renderGoogleButton;
        document.body.appendChild(script);
      } else {
        existing.onload = renderGoogleButton;
      }
    } else {
      renderGoogleButton();
    }
    // Cleanup: reset ref if component unmounts (SPA navigation)
    return () => {
      googleInitRef.current = false;
    };
  }, [googleClientId]);

  const handleGoogleLogin = () => {
    if (!googleClientId) {
      alert("Google login is not configured.");
      return;
    }
    if (!window.google?.accounts?.id) {
      alert("Google login is still loading. Please try again.");
      return;
    }
    // Only prompt, don't re-initialize or re-render
    window.google.accounts.id.prompt();
  };

  const handleFacebookLogin = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      alert("Facebook login is not configured.");
      return;
    }

    const startLogin = () => {
      if (!window.FB) return;
      window.FB.login(
        (response) => {
          if (!response?.authResponse?.accessToken) return;
          socialLogin("facebook", {
            accessToken: response.authResponse.accessToken,
          });
        },
        { scope: "email,public_profile" }
      );
    };

    const existing = document.querySelector("script[data-facebook-sdk]");
    if (existing) {
      startLogin();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v22.0",
      });
      startLogin();
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.dataset.facebookSdk = "true";
    document.body.appendChild(script);
  };

  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const data = await res.json();
    if (data.token) {
      login(data);
      window.location.assign("/");
    } else {
      alert(data.error || t("Login failed"));
    }
  };

  return (
    <div className="max-w-sm mx-auto p-10 card">
      <Seo
        title="Login"
        description="Login to your HI-TECH account."
        canonicalPath="/login"
        noindex
      />

      <h1 className="text-2xl font-bold mb-4">{t("Login")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
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

        <button type="submit" className="w-[100px] bg-blue-600 text-white py-2 block mx-auto">
          {t("Login")}
        </button>
      </form>

      <div className="my-4 text-center text-sm text-gray-500">or</div>

      <div ref={googleBtnRef} className="flex justify-center my-3" />
      {!googleReady && googleClientId && (
        <div className="mb-3 text-center text-xs text-slate-500">
          Loading Google sign-in...
        </div>
      )}

      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={socialLoading}
        className="w-full bg-[#1877F2] text-white py-2 mb-2 disabled:opacity-60"
      >
        Continue with Facebook
      </button>

      <button
        type="button"
        onClick={() => navigate("/forgot-password")}
        className="w-full mt-3 text-sm text-blue-600"
      >
        {t("Forgot password?")}
      </button>
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="w-full mt-2 text-sm text-blue-600"
      >
        {t("Create an account")}
      </button>
    </div>
  );
}
