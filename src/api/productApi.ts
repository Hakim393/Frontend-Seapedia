import api from "./axiosInstance";

export const productApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number | string;
    sort?: string;
  }) => {
    const response = await api.get("/products", { params });
    return response.data;
  },
  getProductById: async (id: number | string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },
  createCategory: async (payload: { name: string }) => {
    const response = await api.post("/products/categories", payload);
    return response.data;
  },
  updateCategory: async (id: number | string, payload: { name: string }) => {
    const response = await api.patch(`/products/categories/${id}`, payload);
    return response.data;
  },
  deleteCategory: async (id: number | string) => {
    const response = await api.delete(`/products/categories/${id}`);
    return response.data;
  },
  getMyProducts: async () => {
    const response = await api.get("/products/seller/my-products");
    return response.data;
  },
  createProduct: async (payload: any) => {
    const response = await api.post("/products", payload);
    return response.data;
  },
  updateProduct: async (id: number | string, payload: any) => {
    const response = await api.patch(`/products/${id}`, payload);
    return response.data;
  },
  deleteProduct: async (id: number | string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
