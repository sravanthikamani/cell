import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );
  const idleTimerRef = useRef(null);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
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
