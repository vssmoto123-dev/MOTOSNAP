'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  updatedAt: string;
  hasReceipt: boolean;
}

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Use the regular getOrderById endpoint but we'll need to get all orders and find the specific one
      // since we don't have a direct admin endpoint for single order details
      const allOrders = await apiClient.getAllOrders();
      const foundOrder = allOrders.find((o: Order) => o.id === parseInt(orderId!));
      
      if (foundOrder) {
        setOrder(foundOrder);
        setError(null);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      setError(err?.error || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order) return;
    
    try {
      setActionLoading(prev => ({...prev, approve: true}));
      await apiClient.approveOrder(order.id);
      await fetchOrderDetails(); // Refresh the order data
      alert('Order approved successfully!');
    } catch (err: any) {
      console.error('Failed to approve order:', err);
      alert(err?.error || 'Failed to approve order');
    } finally {
      setActionLoading(prev => ({...prev, approve: false}));
    }
  };

  const handleReject = async () => {
    if (!order) return;
    
    try {
      setActionLoading(prev => ({...prev, reject: true}));
      await apiClient.rejectOrder(order.id, rejectReason);
      await fetchOrderDetails(); // Refresh the order data
      setShowRejectModal(false);
      setRejectReason('');
      alert('Order rejected successfully!');
    } catch (err: any) {
      console.error('Failed to reject order:', err);
      alert(err?.error || 'Failed to reject order');
    } finally {
      setActionLoading(prev => ({...prev, reject: false}));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriceValue = (price: {doubleValue: () => number} | number): number => {
    if (typeof price === 'number') {
      return price;
    }
    return price.doubleValue();
  };

  const fetchReceiptImage = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(apiClient.getReceiptUrl(order.id), {
        method: 'GET',
        headers: apiClient.getReceiptAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setReceiptImageUrl(imageUrl);
      setShowReceiptModal(true);
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
      alert('Failed to load receipt image');
    }
  };

  const handleReceiptModalClose = () => {
    setShowReceiptModal(false);
    if (receiptImageUrl) {
      URL.revokeObjectURL(receiptImageUrl);
      setReceiptImageUrl(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/admin/orders')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/admin/orders')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </button>
        </div>
        
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Order Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">The order could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/orders')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.part.partName}</h3>
                    <p className="text-gray-600 text-sm">Part #: {item.part.partCode}</p>
                    <p className="text-gray-600 text-sm">Unit Price: ${getPriceValue(item.price).toFixed(2)}</p>
                  </div>
                  <div className="text-center mx-4">
                    <p className="text-gray-900 font-medium">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${(item.qty * getPriceValue(item.price)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold text-black">
                <span>Total Amount:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Status</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt:</span>
                {order.hasReceipt ? (
                  <button
                    onClick={fetchReceiptImage}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    View Receipt
                  </button>
                ) : (
                  <span className="text-sm font-medium text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-sm">{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Admin Actions */}
            {order.status === 'PAYMENT_SUBMITTED' && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Admin Actions</h3>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading.approve}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium"
                >
                  {actionLoading.approve ? 'Approving...' : 'Approve Order'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading.reject}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium"
                >
                  Reject Order
                </button>
              </div>
            )}

            {order.status === 'APPROVED' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">✓ Order Approved</p>
                <p className="text-green-600 text-sm">Payment has been approved by admin</p>
              </div>
            )}

            {order.status === 'REJECTED' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 font-medium">✗ Order Rejected</p>
                <p className="text-red-600 text-sm">Payment has been rejected by admin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Order #{order.id}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason for rejection (optional):</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading.reject}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-red-400"
              >
                {actionLoading.reject ? 'Rejecting...' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && order && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Receipt for Order #{order.id}</h3>
              <button
                onClick={handleReceiptModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              {receiptImageUrl && (
                <img
                  src={receiptImageUrl}
                  alt={`Receipt for order ${order.id}`}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg border border-gray-200"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <a
                href={apiClient.getReceiptUrl(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
              >
                Open in New Tab
              </a>
              <button
                onClick={handleReceiptModalClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}