export type Role = "USER" | "SELLER" | "ADMIN";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: UserProfile;
  };
}
