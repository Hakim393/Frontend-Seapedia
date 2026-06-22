import api from "./axiosInstance";

export const reviewApi = {
  // Product Reviews
  getProductReviews: async (productId: number | string) => {
    const response = await api.get(`/reviews/products/${productId}`);
    return response.data;
  },
  createProductReview: async (productId: number | string, payload: { rating: number; comment?: string }) => {
    const response = await api.post(`/reviews/products/${productId}`, payload);
    return response.data;
  },
  getMyProductReviews: async () => {
    const response = await api.get("/reviews/products/my");
    return response.data;
  },
  updateProductReview: async (id: number | string, payload: { rating: number; comment?: string }) => {
    const response = await api.patch(`/reviews/products/${id}`, payload);
    return response.data;
  },
  deleteProductReview: async (id: number | string) => {
    const response = await api.delete(`/reviews/products/${id}`);
    return response.data;
  },

  // App Reviews
  getAppReviews: async () => {
    const response = await api.get("/reviews/app");
    return response.data;
  },
  createAppReview: async (payload: { rating: number; comment?: string }) => {
    const response = await api.post("/reviews/app", payload);
    return response.data;
  },
  getMyAppReviews: async () => {
    const response = await api.get("/reviews/app/my");
    return response.data;
  },
  updateAppReview: async (id: number | string, payload: { rating: number; comment?: string }) => {
    const response = await api.patch(`/reviews/app/${id}`, payload);
    return response.data;
  },
  deleteAppReview: async (id: number | string) => {
    const response = await api.delete(`/reviews/app/${id}`);
    return response.data;
  }
};
