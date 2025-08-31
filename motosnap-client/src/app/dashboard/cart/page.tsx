'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  quantity: number;
  unitPrice: number;
  inventory: {
    id: number;
    partName: string;
    partCode: string;
    unitPrice: number;
    qty: number;
  };
}

interface Cart {
  id: number;
  cartItems: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
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
      await apiClient.removeFromCart(itemId);
      fetchCart(); // Refresh cart
    } catch (err) {
      alert('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
    }
  };

  const updateQuantity = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      await apiClient.updateCartItemQuantity(itemId, newQuantity);
      fetchCart(); // Refresh cart
    } catch (err) {
      alert('Failed to update quantity');
      console.error('Error updating quantity:', err);
    }
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) return;

    try {
      setOrderLoading(true);
      const order = await apiClient.createOrder();
      
      // Store order data temporarily for the success page
      console.log('🔄 Storing order data for ID:', order.id);
      console.log('🔄 Order data to store:', order);
      localStorage.setItem(`order_${order.id}`, JSON.stringify(order));
      console.log('✅ Order data stored in localStorage');
      
      // Navigate to the static success page
      router.push(`/dashboard/order-success?orderId=${order.id}`);
    } catch (err) {
      alert('Failed to create order');
      console.error('Error creating order:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const getSubtotal = (item: CartItem) => {
    return item.quantity * item.unitPrice;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/dashboard/parts')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Parts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {cart.cartItems.map((item, index) => (
              <div key={item.id} className={`p-6 ${index < cart.cartItems.length - 1 ? 'border-b' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{item.inventory.partName}</h3>
                    <p className="text-gray-600">Part #: {item.inventory.partCode}</p>
                    <p className="text-green-600 font-medium">${item.unitPrice.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity, -1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity, 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      disabled={item.quantity >= item.inventory.qty}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal and Remove */}
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">${getSubtotal(item).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-900">
                <span>Items ({cart.totalItems})</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={proceedToCheckout}
              disabled={orderLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {orderLoading ? 'Creating Order...' : 'Proceed to Checkout'}
            </button>

            <button
              onClick={() => router.push('/dashboard/parts')}
              className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}