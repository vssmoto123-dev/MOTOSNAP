'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, getImageBaseUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { CartResponse, CartItemResponse } from '@/types/customer';

function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setRemovingItemId(itemId);
      console.log('🗑️ Attempting to remove cart item:', itemId);
      
      await apiClient.removeFromCart(itemId);
      console.log('✅ Cart item removed successfully');
      
      fetchCart(); // Refresh cart
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('❌ Error removing from cart:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to remove item from cart';
      if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(`Remove failed: ${errorMessage}`);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setRemovingItemId(null);
    }
  };

  const updateQuantity = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Find the cart item to validate variation stock
    const cartItem = cart?.cartItems.find(item => item.id === itemId);
    if (!cartItem) return;

    try {
      // Check variation stock if item has selected variations
      if (cartItem.selectedVariations) {
        const stockCheck = await apiClient.checkVariationStockPublic(cartItem.inventory.id, {
          selectedVariations: cartItem.selectedVariations,
          quantity: newQuantity
        });

        if (!stockCheck.available) {
          alert(stockCheck.message || 'Insufficient stock for this variation');
          return;
        }
      }
      
      await apiClient.updateCartItemQuantity(itemId, newQuantity);
      fetchCart(); // Refresh cart
    } catch (err) {
      alert('Failed to update quantity');
      console.error('Error updating quantity:', err);
    }
  };

  // Parse variation stock data from inventory item (similar to part-detail page)
  const parseVariationStockDataFromItem = (inventory: any): Record<string, number> => {
    try {
      if (!inventory.variationStock) {
        return {};
      }

      let stockData: Record<string, number> = {};

      if (typeof inventory.variationStock === 'string') {
        const parsed = JSON.parse(inventory.variationStock);
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
      } else if (typeof inventory.variationStock === 'object' && inventory.variationStock !== null) {
        // Handle direct object
        const stockObj = inventory.variationStock as Record<string, unknown>;
        if (stockObj.allocations && typeof stockObj.allocations === 'object') {
          stockData = stockObj.allocations as Record<string, number>;
        } else if (stockObj.allocation && typeof stockObj.allocation === 'object') {
          stockData = stockObj.allocation as Record<string, number>;
        } else {
          stockData = inventory.variationStock as Record<string, number>;
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

  const proceedToCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    console.log('🛒 Proceeding to checkout with cart:', cart);

    try {
      setOrderLoading(true);
      
      // Client-side stock validation for items with variations
      // Note: We can't use the API check-variation-stock endpoint (403 Forbidden - admin only)
      // So we'll use a conservative approach like in the part-detail page
      for (const item of cart.cartItems) {
        if (item.selectedVariations) {
          console.log(`🔍 Validating variation stock for ${item.inventory.partName}:`, item.selectedVariations);

          // Parse variation stock data from the item (client-side approach)
          try {
            const variationStockData = parseVariationStockDataFromItem(item.inventory);

            if (Object.keys(variationStockData).length > 0) {
              // Build variation key for the current selection
              const variationKey = apiClient.buildVariationKey(item.selectedVariations);

              if (variationKey && variationStockData[variationKey] !== undefined) {
                const availableStock = variationStockData[variationKey];
                console.log(`📊 Found variation stock for ${item.inventory.partName}: ${availableStock} units`);

                if (item.quantity > availableStock) {
                  alert(`Insufficient stock for ${item.inventory.partName}. Only ${availableStock} units available for selected variation. Please update your cart.`);
                  setOrderLoading(false);
                  return;
                }
              } else {
                console.log(`📊 No specific stock found for variation key: ${variationKey}, using conservative approach`);
                // Fallback to conservative limit for variation products
                const conservativeMax = Math.min(10, item.inventory.qty);
                if (item.quantity > conservativeMax) {
                  alert(`Limited stock available for ${item.inventory.partName}. Maximum ${conservativeMax} units allowed.`);
                  setOrderLoading(false);
                  return;
                }
              }
            } else {
              console.log(`📊 No variation stock data available for ${item.inventory.partName}, using conservative approach`);
              // Fallback to conservative limit if no variation stock data
              const conservativeMax = Math.min(10, item.inventory.qty);
              if (item.quantity > conservativeMax) {
                alert(`Limited stock available for ${item.inventory.partName}. Maximum ${conservativeMax} units allowed.`);
                setOrderLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error(`Error validating stock for ${item.inventory.partName}:`, error);
            // If client-side validation fails, proceed with order creation
            // Backend will handle the final validation
            console.log(`⚠️ Proceeding with order despite validation error for ${item.inventory.partName}`);
          }
        }
      }

      console.log('🚀 All stock validations passed. Creating order...');
      console.log('📋 Cart state:', {
        cartId: cart?.id,
        itemCount: cart?.cartItems?.length,
        totalAmount: cart?.totalAmount
      });

      const order = await apiClient.createOrder();

      // Store order data temporarily for the success page
      console.log('🔄 Storing order data for ID:', order.id);
      console.log('🔄 Order data to store:', order);
      localStorage.setItem(`order_${order.id}`, JSON.stringify(order));
      console.log('✅ Order data stored in localStorage');
      
      // Navigate to the static success page
      router.push(`/dashboard/order-success?orderId=${order.id}`);
    } catch (err) {
      console.error('Error creating order:', err);

      // Enhanced error handling
      let errorMessage = 'Failed to create order';

      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;

        // Try to extract error details
        if (errorObj.error && typeof errorObj.error === 'string') {
          errorMessage = errorObj.error;
        } else if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        } else if (errorObj.status && typeof errorObj.status === 'number') {
          errorMessage = `Server error ${errorObj.status}: ${errorObj.statusText || 'Unknown error'}`;
        }

        // Log detailed error information
        console.error('Detailed error information:', {
          error: errorObj.error,
          message: errorObj.message,
          status: errorObj.status,
          statusText: errorObj.statusText,
          data: errorObj.data,
          config: errorObj.config,
          stack: errorObj.stack
        });
      } else if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error stack:', err.stack);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      alert(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  const getSubtotal = (item: CartItemResponse) => {
    return item.quantity * item.unitPrice;
  };

  const getProductThumbnail = (item: CartItemResponse) => {
    const { inventory } = item;
    if (inventory.imageUrl) {
      return (
        <img 
          src={`${getImageBaseUrl()}${inventory.imageUrl}`}
          alt={inventory.partName}
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    }
    
    // Fallback with initials
    return (
      <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg">
        <span className="text-lg font-bold text-text opacity-60">
          {inventory.partName.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg text-text">Loading your cart...</div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={fetchCart}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <CustomerLayout>
        {/* Header Section */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="section-header">
              <h1 className="text-4xl font-bold text-text mb-2">Shopping Cart</h1>
              <p className="text-text-muted text-lg">Review and manage your selected motorcycle parts</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="max-w-sm mx-auto">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <h3 className="text-lg font-semibold text-text mb-2">Your cart is empty</h3>
              <p className="text-text-muted mb-6">Start browsing our premium motorcycle parts to build your perfect ride</p>
              <button
                onClick={() => router.push('/dashboard/parts')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
              >
                Browse Parts
              </button>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* Header Section */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="section-header">
            <h1 className="text-4xl font-bold text-text mb-2">Shopping Cart</h1>
            <p className="text-text-muted text-lg">Review and manage your selected motorcycle parts</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden">
              {cart.cartItems.map((item, index) => (
                <div key={item.id} className={`p-6 ${index < cart.cartItems.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Thumbnail */}
                    <div className="flex-shrink-0">
                      {getProductThumbnail(item)}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      {/* Brand */}
                      {item.inventory.brand && (
                        <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                          {item.inventory.brand}
                        </div>
                      )}
                      
                      <h3 className="font-semibold text-lg text-text mb-1 line-clamp-2">{item.inventory.partName}</h3>
                      <p className="text-text-muted text-sm mb-2">Part #: {item.inventory.partCode}</p>
                      
                      {/* Description */}
                      {item.inventory.description && (
                        <p className="text-text-muted text-sm mb-2 line-clamp-1">{item.inventory.description}</p>
                      )}
                      
                      {/* Variation Display */}
                      {item.selectedVariationsDisplay && (
                        <div className="text-sm text-blue-600 mb-2 flex items-center gap-1">
                          <span>📋</span>
                          <span>{item.selectedVariationsDisplay}</span>
                        </div>
                      )}
                      
                      <p className="text-text font-medium">${item.unitPrice.toFixed(2)} each</p>
                      
                      {/* Stock Status */}
                      <div className="text-xs text-text-muted mt-1">
                        {item.inventory.qty <= 5 ? (
                          <span className="text-orange-600 font-medium">
                            ⚠️ Only {item.inventory.qty} left in stock
                          </span>
                        ) : (
                          <span>{item.inventory.qty} in stock</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Actions */}
                    <div className="flex flex-col sm:items-end gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, -1)}
                          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 text-text transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-semibold text-text bg-background px-3 py-2 rounded-lg border border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, 1)}
                          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity >= item.inventory.qty}
                          title={item.quantity >= item.inventory.qty ? 'Maximum quantity reached' : 'Increase quantity'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Subtotal and Remove */}
                      <div className="text-right">
                        <p className="font-bold text-xl text-text mb-2">${getSubtotal(item).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={removingItemId === item.id}
                          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {removingItemId === item.id ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                              <span>Removing...</span>
                            </div>
                          ) : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-text">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text">
                  <span>Items ({cart.totalItems})</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg text-text">
                    <span>Total</span>
                    <span>${cart.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={orderLoading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-text-muted font-semibold transition-all duration-200 mb-3"
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Validating & Creating Order...</span>
                  </div>
                ) : 'Proceed to Checkout'}
              </button>

              <button
                onClick={() => router.push('/dashboard/parts')}
                className="w-full bg-muted text-text py-3 rounded-lg hover:bg-muted/80 font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default function CartPageWrapper() {
  return (
    <ProtectedRoute>
      <CartPage />
    </ProtectedRoute>
  );
}