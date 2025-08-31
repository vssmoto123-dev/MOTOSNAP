export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MECHANIC' | 'CUSTOMER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'MECHANIC' | 'CUSTOMER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiError {
  error: string;
  details?: string;
}