import { SelectedVariations } from './variations';
import { InventoryItem } from './admin';

// Customer shopping cart types
export interface CartItemRequest {
  inventoryId: number;
  quantity: number;
  selectedVariations?: SelectedVariations;  // Optional - selected product variations
}

export interface CartItemResponse {
  id: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
  inventory: InventoryItem;
  // Variation information
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string;      // Formatted for UI display
}

export interface CartResponse {
  id: number;
  cartItems: CartItemResponse[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

// Customer order types
export interface OrderItemResponse {
  id: number;
  qty: number;
  price: number;
  part: InventoryItem;
  // Variation information
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string;      // Formatted for UI display
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  orderItems: OrderItemResponse[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  hasReceipt: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED', 
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Parts browsing for customers
export interface PartsBrowsingFilter {
  search?: string;
  category?: string;
  brand?: string;
  hasVariations?: boolean;               // Filter by products with/without variations
  availableVariations?: SelectedVariations; // Filter by specific variation availability
}

// Customer cart update requests
export interface CartQuantityUpdateRequest {
  quantity: number;
}