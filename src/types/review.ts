import { Product } from "./product";
import { UserProfile } from "./auth";

export interface ProductReview {
  id: number;
  userId: number;
  productId: number;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
  product?: Product;
}

export interface AppReview {
  id: number;
  userId: number;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
}
