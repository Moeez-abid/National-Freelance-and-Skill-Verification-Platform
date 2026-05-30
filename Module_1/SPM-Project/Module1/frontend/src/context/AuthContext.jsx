import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const data = await authService.getMe(savedToken);
          setUser(data.user);
          setToken(savedToken);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    return await authService.register(formData);
  };

  const logout = async () => {
    try { await authService.logout(token); } catch {}
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(token, oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}