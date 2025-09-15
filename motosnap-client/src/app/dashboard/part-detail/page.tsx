'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, getImageBaseUrl } from '@/lib/api';
import { InventoryItem } from '@/types/admin';
import { VariationDefinition, SelectedVariations } from '@/types/variations';
import DebugPanel from '@/components/DebugPanel';

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
          const variationsObj = item.variations as any;
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

  // Handle variation selection
  const handleVariationSelection = (variationId: string, value: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationId]: value
    }));
  };

  // Add to cart with variation support
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const { hasVariations, variations } = parseVariationData(product);

      if (hasVariations) {
        // Check if all required variations are selected
        const requiredVariations = variations.filter(v => v.required);
        const missingRequired = requiredVariations.filter(v =>
          !selectedVariations[v.id] || !selectedVariations[v.id].trim()
        );

        if (missingRequired.length > 0) {
          setError(`Please select required variations: ${missingRequired.map(v => v.name).join(', ')}`);
          return;
        }

        // Add to cart with variations
        await apiClient.addToCart({
          inventoryId: product.id,
          quantity: quantity,
          selectedVariations: selectedVariations
        });
      } else {
        // Add to cart without variations
        await apiClient.addToCart({
          inventoryId: product.id,
          quantity: quantity
        });
      }

      setError(null);
      alert(`Added ${product.partName} to cart!`);

    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      setError(err?.message || 'Failed to add item to cart');
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
  const stockStatus = getStockStatus();

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

            {/* Quantity Selector */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <label className="block text-sm font-medium text-text mb-3">Quantity</label>
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
                  max={product.qty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.qty, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.qty, quantity + 1))}
                  disabled={quantity >= product.qty}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
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
                                checked={selectedVariations[variation.id] === value}
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
                        {Object.entries(selectedVariations)
                          .filter(([_, value]) => value)
                          .map(([varId, value]) => {
                            const variation = variations.find(v => v.id === varId);
                            return `${variation?.name || varId}: ${value}`;
                          })
                          .join(', ')
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.qty === 0 || addingToCart}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                product.qty > 0 && !addingToCart
                  ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-95'
                  : 'bg-muted text-text-muted cursor-not-allowed'
              }`}
            >
              {addingToCart
                ? 'Adding to Cart...'
                : product.qty > 0
                ? 'Add to Cart'
                : 'Out of Stock'}
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
                <div className="flex justify-between">
                  <span className="text-text-muted">Minimum Stock Level:</span>
                  <span className="text-text font-medium">{product.minStockLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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