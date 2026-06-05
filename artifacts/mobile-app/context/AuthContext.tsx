import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  adminName: string | null;
  adminEmail: string | null;
  login: (token: string, name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    Promise.all([
      AsyncStorage.getItem("admin_token"),
      AsyncStorage.getItem("admin_name"),
      AsyncStorage.getItem("admin_email"),
    ]).then(([t, n, e]) => {
      tokenRef.current = t;
      setToken(t);
      setAdminName(n);
      setAdminEmail(e);
      setIsLoading(false);
    });
  }, []);

  const login = async (newToken: string, name: string, email: string) => {
    await Promise.all([
      AsyncStorage.setItem("admin_token", newToken),
      AsyncStorage.setItem("admin_name", name),
      AsyncStorage.setItem("admin_email", email),
    ]);
    tokenRef.current = newToken;
    setToken(newToken);
    setAdminName(name);
    setAdminEmail(email);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem("admin_token"),
      AsyncStorage.removeItem("admin_name"),
      AsyncStorage.removeItem("admin_email"),
    ]);
    tokenRef.current = null;
    setToken(null);
    setAdminName(null);
    setAdminEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAdmin: !!token, isLoading, adminName, adminEmail, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
