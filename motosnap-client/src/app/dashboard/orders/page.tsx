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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
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

  const getStatusAction = (order: Order) => {
    if (order.status === 'PENDING' && !order.hasReceipt) {
      return (
        <button
          onClick={() => router.push(`/dashboard/order-success?orderId=${order.id}`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Upload Receipt
        </button>
      );
    }
    return (
      <button
        onClick={() => router.push(`/dashboard/order-success?orderId=${order.id}`)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Details
      </button>
    );
  };

  const getPriceValue = (price: {doubleValue: () => number} | number): number => {
    if (typeof price === 'number') {
      return price;
    }
    return price.doubleValue();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-900">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600 font-medium mb-2">Error</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/parts')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Parts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-600">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {item.part.partName} (Qty: {item.qty})
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(item.qty * getPriceValue(item.price)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="text-sm text-gray-600">
                        +{order.orderItems.length - 3} more item{order.orderItems.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {order.hasReceipt ? (
                      <span className="text-green-600 font-medium">Receipt uploaded</span>
                    ) : order.status === 'PENDING' ? (
                      <span className="text-yellow-600 font-medium">Payment receipt required</span>
                    ) : (
                      <span>Updated {new Date(order.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div>
                    {getStatusAction(order)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}