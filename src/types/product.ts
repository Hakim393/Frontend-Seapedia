export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  status: ProductStatus;
  categoryId: number;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  store?: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}
