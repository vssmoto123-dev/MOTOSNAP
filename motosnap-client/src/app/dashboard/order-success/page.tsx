'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface OrderItem {
  id: number;
  qty: number;
  price: {
    doubleValue: () => number;
  } | number;
  part: {
    id: number;
    partName: string;
    partCode: string;
  };
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  orderItems: OrderItem[];
  createdAt: string;
  hasReceipt: boolean;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  
  const [receiptForm, setReceiptForm] = useState({
    receiptFile: null as File | null,
    receiptAmount: '',
    notes: ''
  });

  // Get order data from local storage or API
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId || order) return;

      console.log('🔍 Order success page loading, orderId:', orderId);
      setLoading(true);
      setError(null);
      
      // First, try to load from localStorage (fresh from checkout)
      console.log('🔍 Looking for order data in localStorage with key:', `order_${orderId}`);
      const orderData = localStorage.getItem(`order_${orderId}`);
      console.log('🔍 Found order data:', orderData ? 'Yes' : 'No');
      
      if (orderData) {
        try {
          console.log('🔍 Raw order data from localStorage:', orderData);
          const parsedOrder = JSON.parse(orderData);
          console.log('✅ Parsed order data:', parsedOrder);
          setOrder(parsedOrder);
          setError(null);
          setLoading(false);
          // Clean up local storage after using
          localStorage.removeItem(`order_${orderId}`);
          console.log('🗑️ Cleaned up localStorage');
          return;
        } catch (err) {
          console.error('❌ Failed to parse order data:', err);
        }
      }

      // If localStorage data not available, fetch from API
      console.log('🔍 No localStorage data, fetching from API');
      try {
        const fetchedOrder = await apiClient.getOrderById(parseInt(orderId));
        console.log('✅ Fetched order from API:', fetchedOrder);
        setOrder(fetchedOrder);
        setError(null);
      } catch (err: any) {
        console.error('❌ Failed to fetch order from API:', err);
        setError(err?.error || 'Order information not found. Please check your orders in your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, order]);

  const handleReceiptUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order || !receiptForm.receiptFile) return;

    try {
      await apiClient.uploadReceipt(
        order.id, 
        receiptForm.receiptFile, 
        parseFloat(receiptForm.receiptAmount), 
        receiptForm.notes
      );
      
      setShowReceiptUpload(false);
      setReceiptForm({
        receiptFile: null,
        receiptAmount: '',
        notes: ''
      });
      
      alert('Receipt uploaded successfully!');
      
      // Update order status
      setOrder(prev => prev ? {...prev, hasReceipt: true, status: 'PAYMENT_SUBMITTED'} : null);
      
    } catch (err) {
      alert('Failed to upload receipt');
      console.error('Error uploading receipt:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceValue = (price: {doubleValue: () => number} | number): number => {
    if (typeof price === 'number') {
      return price;
    }
    return price.doubleValue();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-900">Loading order...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="text-red-600 font-medium mb-2">Error</div>
            <div className="text-red-600 mb-4">{error}</div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="text-gray-600 font-medium mb-2">Order Not Found</div>
            <div className="text-gray-600 mb-4">The order information could not be loaded.</div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="text-green-600 text-2xl font-bold mb-2">Order Placed Successfully!</div>
          <div className="text-green-700">Your order #{order.id} has been created and is being processed.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order Information</h2>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-gray-900">Order Items</h3>
              {order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.part.partName}</p>
                      <p className="text-gray-600 text-sm">Part #: {item.part.partCode}</p>
                      <p className="text-gray-600 text-sm">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${(item.qty * getPriceValue(item.price)).toFixed(2)}</p>
                      <p className="text-gray-600 text-sm">${getPriceValue(item.price).toFixed(2)} each</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No items found</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-900">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.status === 'PENDING' && !order.hasReceipt && (
              <button
                onClick={() => setShowReceiptUpload(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-3"
              >
                Upload Payment Receipt
              </button>
            )}

            {order.hasReceipt && (
              <div className="bg-green-50 p-4 rounded-lg mb-3">
                <p className="text-green-800 font-medium">Payment receipt uploaded</p>
                <p className="text-green-600 text-sm">Waiting for admin approval</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/parts')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Upload Modal */}
      {showReceiptUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Upload Payment Receipt</h3>
            <form onSubmit={handleReceiptUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Receipt Image File *</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReceiptForm({...receiptForm, receiptFile: file});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {receiptForm.receiptFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {receiptForm.receiptFile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Receipt Amount *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={receiptForm.receiptAmount}
                  onChange={(e) => setReceiptForm({...receiptForm, receiptAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes about the payment..."
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({...receiptForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Upload Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptUpload(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}