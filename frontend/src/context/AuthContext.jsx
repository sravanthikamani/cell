import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeAuthUser } from "../lib/auth";

const AuthContext = createContext();
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem("token");
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(normalizeAuthUser(storedUser, storedToken));
  const idleTimerRef = useRef(null);

  const login = (data) => {
    const nextToken = data?.token || "";
    const nextUser = normalizeAuthUser(data?.user, nextToken);

    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("token", nextToken);
    sessionStorage.removeItem("session_timeout");
  };

  const logout = (reason = "manual") => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (reason === "timeout") {
      sessionStorage.setItem("session_timeout", "1");
      navigate("/session-timeout", { replace: true });
      return;
    }

    sessionStorage.removeItem("session_timeout");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!user || !token) return undefined;

    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => logout("timeout"), IDLE_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
