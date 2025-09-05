'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';

interface InvoicePaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export default function InvoicePaymentModal({
  invoice,
  isOpen,
  onClose,
  onPaymentComplete
}: InvoicePaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    receiptFile: null as File | null,
    receiptAmount: invoice.totalAmount.toString(),
    notes: ''
  });

  // Check payment status when modal opens
  useEffect(() => {
    if (isOpen && invoice.id) {
      checkPaymentStatus();
    }
  }, [isOpen, invoice.id]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const status = await apiClient.getInvoicePaymentStatus(invoice.id);
      console.log('DEBUG: Payment status:', status);
      setPaymentStatus(status);
      
      if (status.status === 'NO_PAYMENT_INITIATED') {
        // Auto-initiate payment
        await initiatePayment();
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      setError(err.message || 'Failed to check payment status');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      const payment = await apiClient.initiateInvoicePayment(invoice.id);
      console.log('DEBUG: Payment initiated:', payment);
      setPaymentStatus(payment);
      setShowReceiptUpload(true);
    } catch (err: any) {
      console.error('Failed to initiate payment:', err);
      setError(err.message || 'Failed to initiate payment');
    }
  };

  const handleReceiptUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptForm.receiptFile) {
      setError('Please select a receipt file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiClient.uploadInvoiceReceipt(
        invoice.id,
        receiptForm.receiptFile,
        parseFloat(receiptForm.receiptAmount),
        receiptForm.notes
      );

      setSuccess('Receipt uploaded successfully! Waiting for admin approval.');
      setShowReceiptUpload(false);
      
      // Refresh payment status
      await checkPaymentStatus();
      onPaymentComplete();
      
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 3000);

    } catch (err: any) {
      console.error('Failed to upload receipt:', err);
      setError(err.message || 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusDisplay = () => {
    if (!paymentStatus || paymentStatus.status === 'NO_PAYMENT_INITIATED') {
      return (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800 font-medium">Ready for Payment</p>
          <p className="text-blue-600 text-sm">Click "Pay Invoice" to proceed with payment</p>
        </div>
      );
    }

    switch (paymentStatus.status) {
      case 'PENDING':
        return (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-yellow-800 font-medium">Payment Initiated</p>
            <p className="text-yellow-600 text-sm">Complete the payment and upload your receipt</p>
          </div>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 font-medium">Receipt Submitted</p>
            <p className="text-blue-600 text-sm">Waiting for admin approval</p>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-800 font-medium">Payment Approved</p>
            <p className="text-green-600 text-sm">Your payment has been verified and approved</p>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-800 font-medium">Payment Rejected</p>
            <p className="text-red-600 text-sm">Please upload a new receipt</p>
            {paymentStatus.receipt?.adminNotes && (
              <p className="text-red-600 text-sm mt-2">Reason: {paymentStatus.receipt.adminNotes}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const canUploadReceipt = () => {
    return paymentStatus && 
           (paymentStatus.status === 'PENDING' || paymentStatus.status === 'REJECTED');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Payment</h2>
              <p className="text-gray-600 mt-1">Invoice #{invoice.invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3">Loading payment information...</span>
            </div>
          ) : (
            <>
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{invoice.booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium text-gray-900">{invoice.booking.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900">{invoice.booking.vehiclePlateNo} - {invoice.booking.vehicleBrand} {invoice.booking.vehicleModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-xl text-gray-900">${invoice.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              {getPaymentStatusDisplay()}

              {/* Payment Actions */}
              <div className="flex justify-end space-x-3 mb-6">
                {canUploadReceipt() && !showReceiptUpload && (
                  <Button
                    onClick={() => setShowReceiptUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Upload Payment Receipt
                  </Button>
                )}
                
                <Button onClick={onClose} variant="secondary">
                  Close
                </Button>
              </div>

              {/* Receipt Upload Modal */}
              {showReceiptUpload && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 text-center">Upload Payment Receipt</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    {/* QR Code Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 text-center">Payment QR Code</h4>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <img 
                            src="/images/duitnow-qr.png" 
                            alt="DuitNow QR Code" 
                            className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkR1aXROb3cgUVIgQ29kZTwvdGV4dD4KPC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="text-center space-y-2">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-sm text-gray-600">DuitNow Account</p>
                            <p className="font-mono font-semibold text-lg text-gray-900">EZCAB 0224</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-600">Invoice Total</p>
                            <p className="font-bold text-xl text-blue-900">${invoice.totalAmount.toFixed(2)}</p>
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs">
                            <p>1. Scan the QR code with your banking app</p>
                            <p>2. Complete the payment</p>
                            <p>3. Upload your receipt below</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Form Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Receipt Upload</h4>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Notes</label>
                          <textarea
                            rows={3}
                            placeholder="Additional notes about the payment..."
                            value={receiptForm.notes}
                            onChange={(e) => setReceiptForm({...receiptForm, notes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Uploading...' : 'Upload Receipt'}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}