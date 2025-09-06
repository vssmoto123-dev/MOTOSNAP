'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, getImageBaseUrl } from '@/lib/api';

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
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'PAYMENT_SUBMITTED':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v13a2 2 0 002 2h6a2 2 0 002-2V4m-8 4v2m0 4v2" />
          </svg>
        );
      case 'APPROVED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'REJECTED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusAction = (order: Order) => {
    if (order.status === 'PENDING' && !order.hasReceipt) {
      return (
        <button
          onClick={() => router.push(`/dashboard/order-success?orderId=${order.id}`)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Upload Receipt
        </button>
      );
    }
    return (
      <button
        onClick={() => router.push(`/dashboard/order-success?orderId=${order.id}`)}
        className="bg-muted text-text px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
      >
        View Details
      </button>
    );
  };

  const getProductThumbnail = (part: OrderItem['part']) => {
    if (part.imageUrl) {
      return (
        <img
          src={`${getImageBaseUrl()}${part.imageUrl}`}
          alt={part.partName}
          className="w-12 h-12 rounded-lg object-cover border border-border"
        />
      );
    }
    
    const initials = part.brand 
      ? part.brand.substring(0, 2).toUpperCase()
      : part.partName.substring(0, 2).toUpperCase();
    
    return (
      <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
        <span className="text-text-muted text-sm font-medium">{initials}</span>
      </div>
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-text-muted text-lg">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-text mb-3">My Orders</h1>
              <p className="text-text-muted text-lg">Manage and track your motorcycle parts orders</p>
            </div>
          </div>
          
          {/* Error State */}
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-text mb-2">Unable to Load Orders</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-text mb-3">My Orders</h1>
            <p className="text-text-muted text-lg">Manage and track your motorcycle parts orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          // Empty State
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-12 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto mb-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-2xl font-semibold text-text mb-3">No Orders Yet</h3>
              <p className="text-text-muted text-lg mb-8">You haven't placed any orders yet. Start by browsing our parts catalog.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/parts')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
            >
              Browse Parts Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-text mb-2">Order #{order.id}</h3>
                      <div className="flex items-center space-x-4 text-text-muted">
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium mb-3 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </div>
                      <p className="text-3xl font-bold text-text">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-border pt-6 mb-6">
                    <h4 className="font-semibold text-text text-lg mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                          <div className="flex items-center space-x-4">
                            {getProductThumbnail(item.part)}
                            <div>
                              <div className="font-medium text-text">{item.part.partName}</div>
                              <div className="text-text-muted text-sm">
                                {item.part.brand && <span className="font-medium">{item.part.brand}</span>}
                                {item.part.brand && item.part.partCode && <span className="mx-1">•</span>}
                                {item.part.partCode && <span>Code: {item.part.partCode}</span>}
                              </div>
                              <div className="text-text-muted text-sm">Quantity: {item.qty}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-text text-lg">
                              ${(item.qty * getPriceValue(item.price)).toFixed(2)}
                            </div>
                            <div className="text-text-muted text-sm">
                              ${getPriceValue(item.price).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="text-center py-4 bg-background rounded-xl border border-border">
                          <span className="text-text-muted">
                            +{order.orderItems.length - 3} more item{order.orderItems.length - 3 !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="flex justify-between items-center pt-6 border-t border-border">
                    <div className="text-text-muted">
                      {order.hasReceipt ? (
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Receipt uploaded</span>
                        </div>
                      ) : order.status === 'PENDING' ? (
                        <div className="flex items-center text-yellow-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="font-medium">Payment receipt required</span>
                        </div>
                      ) : (
                        <span>Updated {new Date(order.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
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
    </div>
  );
}