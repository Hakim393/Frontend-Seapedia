import api from "./axiosInstance";

export const storeApi = {
  getStores: async () => {
    const response = await api.get("/stores");
    return response.data;
  },
  getStoreById: async (id: number | string) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },
  getStoreBySlug: async (slug: string) => {
    const response = await api.get(`/stores/slug/${slug}`);
    return response.data;
  },
  getStoreProducts: async (id: number | string, params?: any) => {
    const response = await api.get(`/stores/${id}/products`, { params });
    return response.data;
  },
  createStore: async (payload: any) => {
    const response = await api.post("/stores", payload);
    return response.data;
  },
  getMyStore: async () => {
    const response = await api.get("/stores/seller/my-store");
    return response.data;
  },
  updateMyStore: async (payload: any) => {
    const response = await api.patch("/stores/seller/my-store", payload);
    return response.data;
  },
  deactivateMyStore: async () => {
    const response = await api.patch("/stores/seller/my-store/deactivate");
    return response.data;
  },
  activateMyStore: async () => {
    const response = await api.patch("/stores/seller/my-store/activate");
    return response.data;
  }
};
