'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface InvoicePayment {
  id: number;
  status: 'PENDING' | 'PAYMENT_SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  invoice: {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    booking: {
      id: number;
      customerName: string;
      serviceName: string;
      vehiclePlateNo: string;
      vehicleBrand: string;
      vehicleModel: string;
    };
  };
  receipt?: {
    id: number;
    amount: number;
    fileUrl: string;
    notes?: string;
    adminNotes?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    uploadedAt: string;
  };
}

export default function InvoicePaymentsPage() {
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'pending') {
        const data = await apiClient.getPendingInvoicePayments();
        setPendingPayments(data);
      } else {
        const data = await apiClient.getAllInvoicePayments();
        setPayments(data);
      }
    } catch (err: any) {
      console.error('Failed to load invoice payments:', err);
      setError(err.message || 'Failed to load invoice payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: number) => {
    try {
      setActionLoading(paymentId);
      await apiClient.approveInvoicePayment(paymentId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to approve payment:', err);
      setError(err.message || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (paymentId: number, reason: string) => {
    try {
      setActionLoading(paymentId);
      await apiClient.rejectInvoicePayment(paymentId, reason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPayment(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reject payment:', err);
      setError(err.message || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (payment: InvoicePayment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const viewReceipt = (payment: InvoicePayment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const getReceiptImageUrl = (payment: InvoicePayment) => {
    if (!payment.receipt?.fileUrl) return null;
    return `/api/invoices/payments/${payment.id}/receipt`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAYMENT_SUBMITTED': 'bg-blue-100 text-blue-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const currentData = activeTab === 'pending' ? pendingPayments : payments;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Payments</h1>
          <p className="text-gray-600">Manage customer invoice payments and receipts</p>
        </div>
        <button
          onClick={loadData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Approvals ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Payments
          </button>
        </nav>
      </div>

      {/* Payments List */}
      {currentData.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoice payments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'pending' ? 'No pending payments to review.' : 'No invoice payments found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service & Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        Invoice #{payment.invoice.id} | Booking #{payment.invoice.booking.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.invoice.booking.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.invoice.booking.serviceName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.invoice.booking.vehiclePlateNo} - {payment.invoice.booking.vehicleBrand} {payment.invoice.booking.vehicleModel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.invoice.totalAmount)}
                      </div>
                      {payment.receipt && (
                        <div className="text-sm text-gray-500">
                          Receipt: {formatCurrency(payment.receipt.amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.receipt ? formatDate(payment.receipt.uploadedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {payment.receipt && (
                        <button
                          onClick={() => viewReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Receipt
                        </button>
                      )}
                      
                      {payment.status === 'PAYMENT_SUBMITTED' && (
                        <>
                          <Button
                            onClick={() => handleApprovePayment(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                          >
                            {actionLoading === payment.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => openRejectModal(payment)}
                            disabled={actionLoading === payment.id}
                            variant="secondary"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                  <p className="text-gray-600">Invoice #{selectedPayment.invoice.invoiceNumber}</p>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPayment.receipt && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Receipt Amount</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatCurrency(selectedPayment.receipt.amount)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Amount</label>
                        <p className="mt-1 text-lg text-gray-900">
                          {formatCurrency(selectedPayment.invoice.totalAmount)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Uploaded At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(selectedPayment.receipt.uploadedAt)}
                        </p>
                      </div>
                      
                      {selectedPayment.receipt.notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Customer Notes</label>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                            {selectedPayment.receipt.notes}
                          </p>
                        </div>
                      )}

                      {selectedPayment.receipt.adminNotes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                          <p className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded">
                            {selectedPayment.receipt.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <img
                          src={getReceiptImageUrl(selectedPayment)}
                          alt="Payment Receipt"
                          className="w-full h-auto rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedPayment.status === 'PAYMENT_SUBMITTED' && (
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Button
                        onClick={() => {
                          setShowReceiptModal(false);
                          openRejectModal(selectedPayment);
                        }}
                        variant="secondary"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject Payment
                      </Button>
                      <Button
                        onClick={() => {
                          setShowReceiptModal(false);
                          handleApprovePayment(selectedPayment.id);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve Payment
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Payment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject this payment for invoice #{selectedPayment.invoice.invoiceNumber}?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reason for rejection..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedPayment(null);
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectPayment(selectedPayment.id, rejectReason)}
                  disabled={actionLoading === selectedPayment.id}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading === selectedPayment.id ? 'Rejecting...' : 'Reject Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}