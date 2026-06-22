import api from "./axiosInstance";

export const cartApi = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },
  addToCart: async (payload: { productId: number; quantity: number }) => {
    const response = await api.post("/cart/items", payload);
    return response.data;
  },
  updateCartItem: async (itemId: number | string, payload: { quantity: number }) => {
    const response = await api.patch(`/cart/items/${itemId}`, payload);
    return response.data;
  },
  deleteCartItem: async (itemId: number | string) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  }
};
