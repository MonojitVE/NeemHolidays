import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || "",
    name: localStorage.getItem("name") || "",
    role: localStorage.getItem("role") || "",
  });

  const saveAuthData = (data) => {
    const token = data?.access_token || "";
    const name = data?.name || "";
    const role = data?.role || "";

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);

      setAuth({
        token,
        name,
        role,
      });
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    saveAuthData(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    saveAuthData(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");

    setAuth({
      token: "",
      name: "",
      role: "",
    });
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      name: auth.name,
      role: auth.role,
      isAuthenticated: Boolean(auth.token),
      login,
      register,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}