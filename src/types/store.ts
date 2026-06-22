export type StoreStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  status: StoreStatus;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}
