import api from "./axiosInstance";
import { AuthResponse, UserProfile } from "../types/auth";

export const authApi = {
  register: async (payload: any) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
  updateProfile: async (payload: Partial<UserProfile>) => {
    const response = await api.patch("/auth/profile", payload);
    return response.data;
  },
  changePassword: async (payload: any) => {
    const response = await api.patch("/auth/change-password", payload);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  }
};
