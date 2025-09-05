'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
    brand?: string;
    description?: string;
    imageUrl?: string;
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

function OrderSuccessContent() {
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

  const getProductThumbnail = (item: OrderItem) => {
    const { part } = item;
    if (part.imageUrl) {
      return (
        <img 
          src={`http://localhost:8080${part.imageUrl}`}
          alt={part.partName}
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    }
    
    // Fallback with initials
    return (
      <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg">
        <span className="text-lg font-bold text-text opacity-60">
          {part.partName.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-text">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-background">
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
              <h1 className="text-4xl font-bold text-text mb-2">Order Status</h1>
              <p className="text-text-muted text-lg">There was an issue loading your order information</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-text mb-2">Error Loading Order</h3>
                <p className="text-text-muted mb-6">{error}</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
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
              <h1 className="text-4xl font-bold text-text mb-2">Order Status</h1>
              <p className="text-text-muted text-lg">Order information not available</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
                <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-text mb-2">Order Not Found</h3>
                <p className="text-text-muted mb-6">The order information could not be loaded</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-4xl font-bold text-text mb-2">Order Confirmation</h1>
            <p className="text-text-muted text-lg">Your order has been successfully placed and is being processed</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-surface border border-green-200 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Order Placed Successfully!</h2>
            <p className="text-text-muted text-lg">
              Your order <span className="font-semibold text-primary">#{order.id}</span> has been created and is being processed
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text">Order Information</h2>
                <p className="text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4 text-text">Order Items</h3>
              {order.orderItems.length > 0 ? (
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-background rounded-xl border border-border">
                      {/* Product Thumbnail */}
                      <div className="flex-shrink-0">
                        {getProductThumbnail(item)}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        {/* Brand */}
                        {item.part.brand && (
                          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                            {item.part.brand}
                          </div>
                        )}
                        
                        <h4 className="font-semibold text-text mb-1">{item.part.partName}</h4>
                        <p className="text-text-muted text-sm mb-2">Part #: {item.part.partCode}</p>
                        
                        {/* Description */}
                        {item.part.description && (
                          <p className="text-text-muted text-sm mb-2">{item.part.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-text-muted">Qty: <span className="font-medium text-text">{item.qty}</span></span>
                          <span className="text-text-muted">Price: <span className="font-medium text-text">${getPriceValue(item.price).toFixed(2)} each</span></span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-text">${(item.qty * getPriceValue(item.price)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-text-muted">No items found in this order</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 mb-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-text">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-text">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-bold text-lg text-text">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.status === 'PENDING' && !order.hasReceipt && (
              <button
                onClick={() => setShowReceiptUpload(true)}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors mb-3"
              >
                Upload Payment Receipt
              </button>
            )}

            {order.hasReceipt && order.status === 'PAYMENT_SUBMITTED' && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 font-medium">Payment receipt uploaded</p>
                    <p className="text-blue-600 text-sm">Waiting for admin approval</p>
                  </div>
                </div>
              </div>
            )}

            {order.hasReceipt && order.status === 'APPROVED' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium">Payment approved</p>
                    <p className="text-green-600 text-sm">Your order has been approved and is being processed</p>
                  </div>
                </div>
              </div>
            )}

            {order.hasReceipt && order.status === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Payment rejected</p>
                    <p className="text-red-600 text-sm mb-3">Your payment receipt was rejected by admin. Please upload a new receipt.</p>
                    <button
                      onClick={() => setShowReceiptUpload(true)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      Upload New Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/parts')}
                className="w-full bg-muted text-text py-3 rounded-lg hover:bg-muted/80 font-medium transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-background border border-border text-text py-3 rounded-lg hover:bg-muted/50 font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Receipt Upload Modal */}
      {showReceiptUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6 text-text text-center">Upload Payment Receipt</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* QR Code Section */}
              <div className="bg-background rounded-xl border border-border p-6">
                <h4 className="text-lg font-semibold mb-4 text-text text-center">Payment QR Code</h4>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-surface rounded-xl p-4 shadow-sm border border-border">
                    <img 
                      src="/images/duitnow-qr.png" 
                      alt="DuitNow QR Code" 
                      className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't load
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkR1aXROb3cgUVIgQ29kZTwvdGV4dD4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <div className="bg-surface rounded-xl p-3 shadow-sm border border-border">
                      <p className="text-sm text-text-muted">DuitNow Account</p>
                      <p className="font-mono font-semibold text-lg text-text">EZCAB 0224</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                      <p className="text-sm text-primary">Order Total</p>
                      <p className="font-bold text-xl text-primary">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-xs text-text-muted max-w-xs space-y-1">
                      <p>1. Scan the QR code with your banking app</p>
                      <p>2. Complete the payment</p>
                      <p>3. Upload your receipt below</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Form Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-text">Receipt Upload</h4>
                <form onSubmit={handleReceiptUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text">Receipt Image File *</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReceiptForm({...receiptForm, receiptFile: file});
                  }}
                  className="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-muted file:text-text hover:file:bg-muted/80"
                />
                {receiptForm.receiptFile && (
                  <p className="text-sm text-text-muted mt-1">Selected: {receiptForm.receiptFile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text">Receipt Amount *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={receiptForm.receiptAmount}
                  onChange={(e) => setReceiptForm({...receiptForm, receiptAmount: e.target.value})}
                  className="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes about the payment..."
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({...receiptForm, notes: e.target.value})}
                  className="w-full px-3 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text resize-none"
                />
              </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                    >
                      Upload Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReceiptUpload(false)}
                      className="flex-1 bg-muted text-text py-3 rounded-lg hover:bg-muted/80 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}