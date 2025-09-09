// Product Variation Type Definitions
// Supports the backend product variations system with JSON-based storage

export interface VariationDefinition {
  id: string;                    // Unique identifier for the variation type
  name: string;                  // Display name (e.g., "Size", "Color", "Model")
  type: 'dropdown' | 'radio' | 'checkbox';  // UI control type
  values: string[];              // Available options (e.g., ["Small", "Medium", "Large"])
  required: boolean;             // Whether selection is mandatory
}

export interface VariationStockData {
  trackByVariation: boolean;     // Whether this product uses variation-specific stock tracking
  allocations: Record<string, number>;  // Stock allocated per variation key
  unallocated: number;           // Flexible stock pool for any variation
}

export interface SelectedVariations {
  [variationId: string]: string; // Map of variation ID to selected value
}

// Helper types for variation management
export interface VariationStockAllocation {
  variationKey: string;          // Encoded variation combination (e.g., "size:Large,color:Red")
  quantity: number;              // Stock allocated to this specific combination
}

export interface VariationStockSummary {
  [variationKey: string]: number; // Summary of stock per variation combination
  total: number;                 // Total inventory stock
  unallocated?: number;          // Unallocated flexible stock
}

// API request/response types for variation management
export interface VariationStockUpdateRequest {
  variationKey: string;
  quantity: number;
}

export interface VariationValidationRequest {
  selectedVariations: SelectedVariations;
}

export interface VariationStockCheckRequest {
  selectedVariations: SelectedVariations;
  quantity: number;
}

export interface VariationValidationResponse {
  valid: boolean;
  message: string;
}

export interface VariationStockCheckResponse {
  available: boolean;
  message: string;
}

// Utility types for UI components
export interface VariationDisplayInfo {
  variationId: string;
  variationName: string;
  selectedValue: string;
  displayString: string;        // Formatted for UI display (e.g., "Size: Large")
}

// Cart and Order variation types
export interface CartItemVariations {
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string; // Pre-formatted display string
}

export interface OrderItemVariations {
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string; // Pre-formatted display string
}

// Parts request variation types  
export interface PartsRequestVariations {
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string; // Pre-formatted display string
}