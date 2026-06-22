import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("seapedia_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("seapedia_token");
      localStorage.removeItem("seapedia_user");
      // Optional: window.location.href = "/login" could be handled here or inside AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
