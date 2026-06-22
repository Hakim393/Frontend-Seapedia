import { Product } from "./product";

export type OrderStatus =
  | "SEDANG_DIKEMAS"
  | "MENUNGGU_PENGIRIM"
  | "SEDANG_DIKIRIM"
  | "PESANAN_SELESAI"
  | "DIKEMBALIKAN";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  storeId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: number;
  shippingAddress: string;
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistories?: OrderStatusHistory[];
  store?: {
    id: number;
    name: string;
    logoUrl?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
