import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { core } from "../api/http";
import { decodeToken, isExpired } from "../utils/jwt";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const readStoredToken = () => {
  const stored = localStorage.getItem("token");
  if (stored && isExpired(stored)) {
    localStorage.removeItem("token");
    return null;
  }
  return stored;
};

export function AuthProvider({ children }) {
  const toast = useToast();
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Load the profile for a restored session.
  useEffect(() => {
    if (!token || user) return undefined;
    let cancelled = false;
    core
      .get("/auth/me")
      .then((r) => !cancelled && setUser(r.data))
      .catch(() => {
        // Offline or older backend: fall back to what the token itself says.
        const email = decodeToken(token)?.sub;
        if (!cancelled && email) setUser({ name: email.split("@")[0], email });
      });
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  // Any API call that comes back 401 ends the session.
  useEffect(() => {
    const onUnauthorized = () => {
      if (!localStorage.getItem("token")) return;
      logout();
      toast.show("Your session expired. Please sign in again.");
    };
    window.addEventListener("kc:unauthorized", onUnauthorized);
    return () => window.removeEventListener("kc:unauthorized", onUnauthorized);
  }, [logout, toast]);

  const login = useCallback(async (email, password) => {
    const { data } = await core.post("/auth/login", { email, password });
    // Current backend returns { token, user }; the original returned the bare token.
    const jwt = typeof data === "string" ? data : data.token;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(typeof data === "string" ? null : data.user);
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      await core.post("/auth/register", { name, email, password });
      await login(email, password);
    },
    [login]
  );

  const value = useMemo(
    () => ({ token, user, login, register, logout, isAuthenticated: !!token }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
