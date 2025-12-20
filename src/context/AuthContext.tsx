"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  const handleSetAccessToken = (token: string | null) => {
    setAccessToken(token);
    if (token) {
      Cookies.set("accessToken", token, { expires: 7 }); // Expires in 7 days
    } else {
      Cookies.remove("accessToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken: handleSetAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
