'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<number | null>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: number) => {
    try {
      setActionLoading(prev => ({...prev, [orderId]: true}));
      await apiClient.approveOrder(orderId);
      await fetchOrders(); // Refresh the list
      alert('Order approved successfully!');
    } catch (err: any) {
      console.error('Failed to approve order:', err);
      alert(err?.error || 'Failed to approve order');
    } finally {
      setActionLoading(prev => ({...prev, [orderId]: false}));
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      setActionLoading(prev => ({...prev, [orderId]: true}));
      await apiClient.rejectOrder(orderId, rejectReason);
      await fetchOrders(); // Refresh the list
      setShowRejectModal(null);
      setRejectReason('');
      alert('Order rejected successfully!');
    } catch (err: any) {
      console.error('Failed to reject order:', err);
      alert(err?.error || 'Failed to reject order');
    } finally {
      setActionLoading(prev => ({...prev, [orderId]: false}));
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

  const getStatusCount = (status: string) => {
    if (status === 'ALL') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const fetchReceiptImage = async (orderId: number) => {
    try {
      const response = await fetch(apiClient.getReceiptUrl(orderId), {
        method: 'GET',
        headers: apiClient.getReceiptAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setReceiptImageUrl(imageUrl);
      setShowReceiptModal(orderId);
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
      alert('Failed to load receipt image');
    }
  };

  const handleReceiptModalClose = () => {
    setShowReceiptModal(null);
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
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Manage customer orders and payment approvals</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['ALL', 'PENDING', 'PAYMENT_SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === status
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.replace('_', ' ')} ({getStatusCount(status)})
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">No orders found for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items ({order.orderItems.length}):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.orderItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {item.part.partName} (x{item.qty})
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(item.qty * getPriceValue(item.price)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="text-sm text-gray-500 col-span-2">
                        +{order.orderItems.length - 4} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {order.hasReceipt && (
                      <button
                        onClick={() => fetchReceiptImage(order.id)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                      >
                        Receipt Available
                      </button>
                    )}
                    <span>Updated {new Date(order.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/admin/orders/details?orderId=${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {order.status === 'PAYMENT_SUBMITTED' && (
                      <>
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={actionLoading[order.id]}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-400"
                        >
                          {actionLoading[order.id] ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(order.id)}
                          disabled={actionLoading[order.id]}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Order #{showRejectModal}</h3>
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
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={actionLoading[showRejectModal]}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-red-400"
              >
                {actionLoading[showRejectModal] ? 'Rejecting...' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Receipt for Order #{showReceiptModal}</h3>
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
                  alt={`Receipt for order ${showReceiptModal}`}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg border border-gray-200"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <a
                href={apiClient.getReceiptUrl(showReceiptModal)}
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