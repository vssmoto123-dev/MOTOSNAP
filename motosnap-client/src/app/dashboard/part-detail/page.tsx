'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, getImageBaseUrl } from '@/lib/api';
import { InventoryItem } from '@/types/admin';
import { VariationDefinition, SelectedVariations, VariationUtils } from '@/types/variations';
import PartsGrid from '@/components/PartsGrid';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariations>({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<InventoryItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);

  // Helper function to parse variation data
  const parseVariationData = (item: InventoryItem): { hasVariations: boolean; variations: VariationDefinition[] } => {
    let variations: VariationDefinition[] = [];
    let hasVariations = false;

    try {
      if (item.variations) {
        if (typeof item.variations === 'string') {
          const parsed = JSON.parse(item.variations);
          if (parsed && typeof parsed === 'object') {
            if (parsed.options && Array.isArray(parsed.options)) {
              variations = parsed.options;
              hasVariations = parsed.hasVariations === true;
            } else if (Array.isArray(parsed)) {
              variations = parsed;
              hasVariations = variations.length > 0;
            }
          }
        } else if (Array.isArray(item.variations)) {
          variations = item.variations;
          hasVariations = variations.length > 0;
        } else if (typeof item.variations === 'object' && item.variations !== null) {
          const variationsObj = item.variations as Record<string, unknown>;
          if (variationsObj.options && Array.isArray(variationsObj.options)) {
            variations = variationsObj.options;
            hasVariations = variationsObj.hasVariations === true;
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse variation data:', error);
      variations = [];
      hasVariations = false;
    }

    return { hasVariations, variations };
  };

  // Parse variation stock data from product
  const parseVariationStockData = (item: InventoryItem): Record<string, number> => {
    try {
      if (!item.variationStock) {
        return {};
      }

      let stockData: Record<string, number> = {};

      if (typeof item.variationStock === 'string') {
        const parsed = JSON.parse(item.variationStock);
        if (parsed && typeof parsed === 'object') {
          // Handle different possible structures
          if (parsed.allocations && typeof parsed.allocations === 'object') {
            stockData = parsed.allocations;
          } else if (parsed.allocation && typeof parsed.allocation === 'object') {
            stockData = parsed.allocation;
          } else {
            // Assume it's a direct key-value mapping
            stockData = parsed;
          }
        }
      } else if (typeof item.variationStock === 'object' && item.variationStock !== null) {
        // Handle direct object
        const stockObj = item.variationStock as unknown as Record<string, unknown>;
        if (stockObj.allocations && typeof stockObj.allocations === 'object') {
          stockData = stockObj.allocations as Record<string, number>;
        } else if (stockObj.allocation && typeof stockObj.allocation === 'object') {
          stockData = stockObj.allocation as Record<string, number>;
        } else {
          stockData = item.variationStock as unknown as Record<string, number>;
        }
      }

      // Convert all values to numbers and filter out invalid ones
      const result: Record<string, number> = {};
      Object.entries(stockData).forEach(([key, value]) => {
        const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
        if (!isNaN(numValue) && numValue >= 0) {
          result[key] = numValue;
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to parse variation stock data:', error);
      return {};
    }
  };

  // Handle variation selection
  const handleVariationSelection = (variationId: string, value: string) => {
    const newSelectedVariations = VariationUtils.setValue(selectedVariations, variationId, value);
    setSelectedVariations(newSelectedVariations);
  };


  // Get current max quantity based on selected variations
  const getMaxQuantity = () => {
    if (!product) return 1;

    if (hasVariations) {
      // Get the variations array from parsed product data
      const { variations: productVariations } = parseVariationData(product);

      // If variations are required but not all selected, limit to 1 until selection is complete
      const validation = VariationUtils.validateRequiredVariations(selectedVariations, productVariations);
      if (!validation.valid) {
        return 1; // Limit to 1 until all required variations are selected
      }

      // Try to get variation-specific stock
      try {
        const variationStockData = parseVariationStockData(product);

        if (Object.keys(variationStockData).length > 0) {
          // Build variation key for the current selection
          const variationKey = apiClient.buildVariationKey(selectedVariations);

          if (variationKey && variationStockData[variationKey] !== undefined) {
            const variationStock = variationStockData[variationKey];
            console.log(`📊 Found variation-specific stock: ${variationStock} for key: ${variationKey}`);
            return variationStock;
          } else {
            console.log(`📊 No stock found for variation key: ${variationKey}, available keys:`, Object.keys(variationStockData));
          }
        } else {
          console.log('📊 No variation stock data available');
        }
      } catch (error) {
        console.error('📊 Error calculating variation stock:', error);
      }

      // Fallback to conservative approach if variation stock data is unavailable
      const conservativeMax = Math.min(10, product?.qty || 1);
      console.log(`📊 Using conservative max: ${conservativeMax}`);
      return conservativeMax;
    }

    // For non-variation products, use total stock
    return product?.qty || 1;
  };

  // Get current stock status for display
  const getCurrentStockStatus = () => {
    if (!product) return null;

    if (hasVariations) {
      // Get the variations array from parsed product data
      const { variations: productVariations } = parseVariationData(product);

      const validation = VariationUtils.validateRequiredVariations(selectedVariations, productVariations);
      if (!validation.valid) {
        return { text: 'Select options to check stock', className: 'text-gray-600 bg-gray-100' };
      }

      // For variation products, show conservative stock message since we can't check variation-specific stock
      const maxQty = getMaxQuantity();
      if (maxQty === 0) {
        return { text: 'Out of Stock', className: 'text-red-600 bg-red-100' };
      } else if (maxQty <= 5) {
        return { text: `Limited Stock (max ${maxQty})`, className: 'text-yellow-600 bg-yellow-100' };
      } else {
        return { text: `In Stock (max ${maxQty} per variation)`, className: 'text-green-600 bg-green-100' };
      }
    }

    // Fallback to original stock status for non-variation products
    if (product.qty === 0) {
      return { text: 'Out of Stock', className: 'text-red-600 bg-red-100' };
    } else if (product.qty <= 5) {
      return { text: `Low Stock (${product.qty} left)`, className: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: `In Stock (${product.qty} available)`, className: 'text-green-600 bg-green-100' };
    }
  };

  // Add to cart with variation support and basic validation
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    setError(null);

    try {
      const { hasVariations, variations } = parseVariationData(product);

      if (hasVariations) {
        // Check if all required variations are selected
        const validation = VariationUtils.validateRequiredVariations(selectedVariations, variations);
        if (!validation.valid) {
          setError(`Please select required variations: ${validation.missing.join(', ')}`);
          return;
        }

        // For variation products, use conservative limit since we can't check variation-specific stock
        const maxAllowed = getMaxQuantity();
        if (quantity > maxAllowed) {
          setError(`Limited quantity available for this variation. Maximum: ${maxAllowed}`);
          return;
        }

        // Add to cart with variations
        await apiClient.addToCart({
          inventoryId: product.id,
          quantity: quantity,
          selectedVariations: selectedVariations
        });
      } else {
        // Validate stock for non-variation products
        if (quantity > product.qty) {
          setError(`Insufficient stock. Available: ${product.qty}`);
          return;
        }

        // Add to cart without variations
        await apiClient.addToCart({
          inventoryId: product.id,
          quantity: quantity
        });
      }

      // Success!
      alert(`Added ${product.partName} to cart!`);

      // Reset form for variation products
      if (hasVariations) {
        setSelectedVariations({});
        setQuantity(1);
      } else {
        // For non-variation products, reset quantity to 1
        setQuantity(1);
      }

    } catch (err: unknown) {
      let errorMessage = 'Failed to add item to cart';

      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        // Handle specific variation stock errors
        if (errorObj.error === 'Insufficient stock for selected variation') {
          errorMessage = 'This specific variation has limited stock. Please try a smaller quantity or different options.';
        } else if (typeof errorObj.error === 'string') {
          errorMessage = errorObj.error;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error('Failed to add to cart:', err);
      setError(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('No product ID specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getPart(parseInt(productId));
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch related products when product is loaded
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        setLoadingRelated(true);
        const related = await apiClient.getRelatedProducts(product.id);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Update max quantity when product or selected variations change
  useEffect(() => {
    if (product) {
      const newMaxQuantity = getMaxQuantity();
      setMaxQuantity(newMaxQuantity);

      // Also reset quantity to 1 if it exceeds the new max
      if (quantity > newMaxQuantity) {
        setQuantity(1);
      }
    }
  }, [product, selectedVariations, quantity]);

  // Legacy stock status function (deprecated in favor of getCurrentStockStatus)
  const getStockStatus = () => {
    if (!product) return null;

    if (product.qty === 0) {
      return { text: 'Out of Stock', className: 'text-red-600 bg-red-100' };
    } else if (product.qty <= 5) {
      return { text: `Low Stock (${product.qty} left)`, className: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: `In Stock (${product.qty} available)`, className: 'text-green-600 bg-green-100' };
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ensureGetStockStatusUsed = getStockStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-text">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error || 'Product not found'}</div>
          <button
            onClick={() => router.push('/dashboard/parts')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Parts Catalog
          </button>
        </div>
      </div>
    );
  }

  const { hasVariations, variations } = parseVariationData(product);
  const stockStatus = getCurrentStockStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard/parts')}
            className="flex items-center text-primary hover:text-primary/80 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Parts Catalog
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{product.partName}</h1>
              <p className="text-text-muted">Part #: {product.partCode}</p>
            </div>
            <div className={`mt-4 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${stockStatus?.className}`}>
              {stockStatus?.text}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl border border-border p-8">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${getImageBaseUrl()}${product.imageUrl}`}
                  alt={product.partName}
                  className="w-full h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-6xl font-bold text-text opacity-20">
                    {product.partName.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-4xl font-bold text-text">
                  ${typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : '0.00'}
                </div>
                {product.brand && (
                  <div className="text-sm font-semibold text-primary uppercase tracking-wide">
                    {product.brand}
                  </div>
                )}
              </div>

              {product.category && (
                <div className="text-sm text-text-muted mb-4">
                  Category: {product.category}
                </div>
              )}
            </div>

            {/* Variations */}
            {hasVariations && variations.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4">Product Options</h3>
                <div className="space-y-4">
                  {variations.map((variation) => (
                    <div key={variation.id} className="space-y-2">
                      <label className="block text-sm font-medium text-text">
                        {variation.name}
                        {variation.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {variation.type === 'dropdown' && (
                        <select
                          value={selectedVariations[variation.id] || ''}
                          onChange={(e) => handleVariationSelection(variation.id, e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select {variation.name.toLowerCase()}...</option>
                          {variation.values.filter(val => val.trim()).map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      )}

                      {variation.type === 'radio' && (
                        <div className="space-y-2">
                          {variation.values.filter(val => val.trim()).map((value) => (
                            <label key={value} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`variation_${variation.id}`}
                                value={value}
                                checked={VariationUtils.getSelectedValue(selectedVariations, variation.id) === value}
                                onChange={(e) => handleVariationSelection(variation.id, e.target.value)}
                                className="text-primary"
                              />
                              <span className="text-text">{value}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Show current selection */}
                  {Object.keys(selectedVariations).length > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <strong className="text-primary text-sm">Selected:</strong>{' '}
                      <span className="text-text text-sm">
                        {VariationUtils.formatForDisplay(selectedVariations, variations)}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <label className="block text-sm font-medium text-text mb-3">
                Quantity
                {hasVariations && (
                  <span className="text-xs text-text-muted ml-2">
                    (Max: {maxQuantity})
                  </span>
                )}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1));
                    setQuantity(newQuantity);

                  }}
                  className="w-20 text-center px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={hasVariations && maxQuantity === 0}
                />
                <button
                  onClick={() => {
                    const newQuantity = Math.min(maxQuantity, quantity + 1);
                    setQuantity(newQuantity);

                  }}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={maxQuantity === 0 || addingToCart || (hasVariations && Object.keys(selectedVariations).length === 0)}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                maxQuantity > 0 && !addingToCart && (!hasVariations || Object.keys(selectedVariations).length > 0)
                  ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-95'
                  : 'bg-muted text-text-muted cursor-not-allowed'
              }`}
            >
              {addingToCart
                ? 'Adding to Cart...'
                : maxQuantity === 0
                ? 'Out of Stock'
                : hasVariations && Object.keys(selectedVariations).length === 0
                ? 'Select Options First'
                : 'Add to Cart'}
            </button>

            {/* Description */}
            {product.description && (
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-3">Description</h3>
                <p className="text-text-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Information */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Product Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Part Code:</span>
                  <span className="text-text font-medium">{product.partCode}</span>
                </div>
                {product.brand && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Brand:</span>
                    <span className="text-text font-medium">{product.brand}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Category:</span>
                    <span className="text-text font-medium">{product.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {loadingRelated ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <div className="text-text">Loading related products...</div>
                  </div>
                </div>
              ) : (
                <PartsGrid
                  parts={relatedProducts}
                  title="Related Products"
                  maxItems={8}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-text">Loading...</div>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}