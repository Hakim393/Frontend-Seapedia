import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "../types/auth";
import { authApi } from "../api/authApi";
import { useToast } from "./ToastContext";

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem("seapedia_token");
    const storedUser = localStorage.getItem("seapedia_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("seapedia_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    try {
      setLoading(true);
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem("seapedia_token", token);
        localStorage.setItem("seapedia_user", JSON.stringify(user));
        setToken(token);
        setUser(user);
        showToast("Login berhasil! Selamat datang.", "success");
        return res;
      } else {
        throw new Error(res.message || "Email atau password salah");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Gagal masuk. Coba lagi.";
      showToast(errMsg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    try {
      setLoading(true);
      const res = await authApi.register(payload);
      if (res.success) {
        showToast("Registrasi berhasil! Silakan login.", "success");
        return res;
      } else {
        throw new Error(res.message || "Gagal mendaftar");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Gagal mendaftar.";
      showToast(errMsg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("seapedia_token");
    localStorage.removeItem("seapedia_user");
    setToken(null);
    setUser(null);
    showToast("Berhasil keluar dari akun.", "success");
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const res = await authApi.updateProfile(profileData);
      if (res.success && res.data) {
        const updatedUser = { ...user, ...res.data } as UserProfile;
        localStorage.setItem("seapedia_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        showToast("Profil berhasil diperbarui", "success");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal memperbarui profil.";
      showToast(errMsg, "error");
    }
  };

  const refreshProfile = async () => {
    if (!localStorage.getItem("seapedia_token")) return;
    try {
      const res = await authApi.getProfile();
      if (res?.success && res?.data) {
        localStorage.setItem("seapedia_user", JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch (e) {
      // Profile fetching failed, token might be invalid
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
