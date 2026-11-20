import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    api.get("/auth/me")
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          setSessionError("Votre session a expiré. Veuillez vous reconnecter.");
        } else {
          setSessionError(error.response?.data?.message || "Impossible de vérifier la session pour le moment.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function authenticate(path, credentials) {
    const { data } = await api.post(path, credentials);
    window.localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setSessionError("");
    return data.user;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSessionError("");
  }

  const value = useMemo(() => ({
    user,
    loading,
    sessionError,
    login: (credentials) => authenticate("/auth/login", credentials),
    register: (credentials) => authenticate("/auth/register", credentials),
    logout
  }), [user, loading, sessionError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return context;
}
