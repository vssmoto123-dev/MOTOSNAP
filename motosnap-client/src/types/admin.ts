import { VariationDefinition, VariationStockData } from './variations';

export interface InventoryItem {
  id: number;
  partName: string;
  partCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  minStockLevel: number;
  category?: string;
  brand?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lowStock: boolean;
  imageUrl?: string;
  // Variation support
  variations?: string | VariationDefinition[]; // JSON string or parsed array
  variationStock?: string | VariationStockData; // JSON string or parsed object
}

export interface InventoryRequest {
  partName: string;
  partCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  minStockLevel: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
  // Variation support  
  variations?: VariationDefinition[];         // Variation definitions for this product
  variationStock?: Record<string, number>;    // Stock allocation per variation combination
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes?: number;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'MECHANIC' | 'ADMIN';
  createdAt: string;
  active: boolean;
}

export interface UpdateRoleRequest {
  newRole: 'CUSTOMER' | 'MECHANIC' | 'ADMIN';
}

export interface UserStats {
  totalUsers: number;
  customerCount: number;
  mechanicCount: number;
  adminCount: number;
}