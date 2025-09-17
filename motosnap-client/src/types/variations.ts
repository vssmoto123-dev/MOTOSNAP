// Product Variation Type Definitions
// Supports the backend product variations system with JSON-based storage

export interface VariationDefinition {
  id: string;                    // Unique identifier for the variation type
  name: string;                  // Display name (e.g., "Size", "Color", "Model")
  type: 'dropdown' | 'radio';     // UI control type
  values: string[];              // Available options (e.g., ["Small", "Medium", "Large"])
  required: boolean;             // Whether selection is mandatory
}

export interface VariationStockData {
  trackByVariation: boolean;     // Whether this product uses variation-specific stock tracking
  allocations: Record<string, number>;  // Stock allocated per variation key
  unallocated: number;           // Flexible stock pool for any variation
}

export interface SelectedVariations {
  [variationId: string]: string; // Map of variation ID to selected value (simplified for dropdown/radio only)
}

// Helper types for variation management
export interface VariationStockAllocation {
  variationKey: string;          // Encoded variation combination (e.g., "size:Large,color:Red")
  quantity: number;              // Stock allocated to this specific combination
}

export interface VariationStockSummary {
  [variationKey: string]: number | undefined; // Summary of stock per variation combination
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

// Utility functions for variation handling
export class VariationUtils {
  /**
   * Get selected value for a variation (simplified for dropdown/radio only)
   */
  static getSelectedValue(
    selectedVariations: SelectedVariations,
    variationId: string
  ): string {
    const value = selectedVariations[variationId];
    return typeof value === 'string' ? value : '';
  }

  /**
   * Set value for dropdown/radio variations
   */
  static setValue(
    selectedVariations: SelectedVariations,
    variationId: string,
    value: string
  ): SelectedVariations {
    return {
      ...selectedVariations,
      [variationId]: value
    };
  }

  /**
   * Format variations for display
   */
  static formatForDisplay(
    selectedVariations: SelectedVariations,
    variationDefinitions: VariationDefinition[]
  ): string {
    return variationDefinitions
      .map(variation => {
        const value = this.getSelectedValue(selectedVariations, variation.id);
        if (!value) return '';

        return `${variation.name}: ${value}`;
      })
      .filter(item => item.trim())
      .join(', ');
  }

  /**
   * Check if all required variations are selected
   */
  static validateRequiredVariations(
    selectedVariations: SelectedVariations,
    variationDefinitions: VariationDefinition[]
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    variationDefinitions
      .filter(v => v.required)
      .forEach(variation => {
        const value = this.getSelectedValue(selectedVariations, variation.id);
        if (!value) {
          missing.push(variation.name);
        }
      });

    return {
      valid: missing.length === 0,
      missing
    };
  }
}