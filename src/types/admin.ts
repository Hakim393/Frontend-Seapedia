import { UserProfile } from "./auth";
import { Store } from "./store";
import { Product } from "./product";
import { Order } from "./order";

export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentUsers: UserProfile[];
  recentStores: Store[];
  recentProducts: Product[];
  recentOrders: Order[];
}