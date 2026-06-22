import api from "./axiosInstance";

export const adminApi = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  getUserById: async (id: number | string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUserRole: async (id: number | string, role: string) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id: number | string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getStores: async () => {
    const response = await api.get("/admin/stores");
    return response.data;
  },
  updateStoreStatus: async (id: number | string, status: string) => {
    const response = await api.patch(`/admin/stores/${id}/status`, { status });
    return response.data;
  },
  getProducts: async () => {
    const response = await api.get("/admin/products");
    return response.data;
  },
  updateProductStatus: async (id: number | string, status: string) => {
    const response = await api.patch(`/admin/products/${id}/status`, { status });
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get("/admin/orders");
    return response.data;
  },
  getOrderById: async (id: number | string) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },
  getProductReviews: async () => {
    const response = await api.get("/admin/reviews/products");
    return response.data;
  },
  deleteProductReview: async (id: number | string) => {
    const response = await api.delete(`/admin/reviews/products/${id}`);
    return response.data;
  },
  getAppReviews: async () => {
    const response = await api.get("/admin/reviews/app");
    return response.data;
  },
  deleteAppReview: async (id: number | string) => {
    const response = await api.delete(`/admin/reviews/app/${id}`);
    return response.data;
  }
};
