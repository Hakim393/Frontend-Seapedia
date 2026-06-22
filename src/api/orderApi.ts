import api from "./axiosInstance";

export type OrderStatus =
  | "SEDANG_DIKEMAS"
  | "MENUNGGU_PENGIRIM"
  | "SEDANG_DIKIRIM"
  | "PESANAN_SELESAI"
  | "DIKEMBALIKAN";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type CheckoutPayload = {
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
};

type OrderQueryParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
};

type UpdateOrderStatusPayload = {
  status: OrderStatus | string;
  note?: string;
  courierName?: string;
  trackingNumber?: string;
};

type UpdateOrderPaymentPayload = {
  paymentStatus: PaymentStatus | string;
};

type ReturnOrderPayload = {
  reason?: string;
};

export const orderApi = {
  checkout: async (payload: CheckoutPayload) => {
    const response = await api.post("/orders/checkout", payload);
    return response.data;
  },

  getMyOrders: async (params?: OrderQueryParams) => {
    const response = await api.get("/orders/my-orders", {
      params,
    });

    return response.data;
  },

  getMyOrderById: async (id: number | string) => {
    const response = await api.get(`/orders/my-orders/${id}`);
    return response.data;
  },

  completeMyOrder: async (id: number | string) => {
    const response = await api.patch(`/orders/my-orders/${id}/complete`);
    return response.data;
  },

  returnMyOrder: async (
    id: number | string,
    payload?: ReturnOrderPayload
  ) => {
    const response = await api.patch(`/orders/my-orders/${id}/return`, payload);
    return response.data;
  },

  getSellerOrders: async (params?: OrderQueryParams) => {
    const response = await api.get("/orders/seller", {
      params,
    });

    return response.data;
  },

  getSellerOrderById: async (id: number | string) => {
    const response = await api.get(`/orders/seller/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    id: number | string,
    payload: UpdateOrderStatusPayload
  ) => {
    const response = await api.patch(`/orders/${id}/status`, payload);
    return response.data;
  },

  updateOrderPayment: async (
    id: number | string,
    payload: UpdateOrderPaymentPayload
  ) => {
    const response = await api.patch(`/orders/${id}/payment`, payload);
    return response.data;
  },
};