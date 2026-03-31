import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("clinic_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("clinic_token"));
  const [loading, setLoading] = useState(false);

  const persistSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem("clinic_token", nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem("clinic_token");
      setToken(null);
    }

    if (nextUser) {
      localStorage.setItem("clinic_user", JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem("clinic_user");
      setUser(null);
    }
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", payload);
      persistSession(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      persistSession(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => persistSession(null, null);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token)
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
