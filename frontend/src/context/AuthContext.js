"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setToken(savedToken);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch user", res.status, await res.text());
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user || data); // depending on backend response
        localStorage.setItem("user", JSON.stringify(data.user || data));
      } catch (err) {
        console.error("Auth fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
