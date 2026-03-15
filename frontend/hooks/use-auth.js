"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = window.localStorage.getItem("neoconnect_token");
    const savedUser = window.localStorage.getItem("neoconnect_user");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    api.me(savedToken)
      .then((response) => {
        setUser(response.user);
        window.localStorage.setItem("neoconnect_user", JSON.stringify(response.user));
      })
      .catch(() => {
        window.localStorage.removeItem("neoconnect_token");
        window.localStorage.removeItem("neoconnect_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    persistSession(data);
    router.push("/dashboard");
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    persistSession(data);
    router.push("/dashboard");
  };

  const persistSession = (data) => {
    setToken(data.token);
    setUser(data.user);
    window.localStorage.setItem("neoconnect_token", data.token);
    window.localStorage.setItem("neoconnect_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem("neoconnect_token");
    window.localStorage.removeItem("neoconnect_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
