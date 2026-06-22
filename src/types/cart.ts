import { Product } from "./product";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Cart {
  id: number;
  userId: number;
  storeId?: number; // Backend restriction: single store per cart
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}
