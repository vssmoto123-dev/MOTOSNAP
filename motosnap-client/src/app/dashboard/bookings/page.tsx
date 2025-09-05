'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { BookingResponse, BookingStatus } from '@/types/booking';
import { Invoice } from '@/types/invoice';
import InvoicePreview from '@/components/InvoicePreview';
import InvoicePaymentModal from '@/components/InvoicePaymentModal';

type TabType = 'all' | 'active' | 'pending' | 'completed';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserBookings();
      
      // For completed bookings, fetch additional invoice and payment information
      const bookingsWithInvoices = await Promise.all(
        data.map(async (booking) => {
          if (booking.status === 'COMPLETED') {
            try {
              const detailedBooking = await apiClient.getBookingWithInvoice(booking.id);
              
              // If booking has invoice, check payment status
              if (detailedBooking.invoice?.id) {
                try {
                  const paymentStatus = await apiClient.getInvoicePaymentStatus(detailedBooking.invoice.id);
                  console.log(`Payment status for invoice ${detailedBooking.invoice.id}:`, paymentStatus);
                  
                  // Add payment status to the invoice object
                  detailedBooking.invoice.invoicePayment = paymentStatus.status !== 'NO_PAYMENT_INITIATED' ? paymentStatus : null;
                } catch (paymentErr) {
                  console.log(`No payment data for invoice ${detailedBooking.invoice.id}`);
                  detailedBooking.invoice.invoicePayment = null;
                }
              }
              
              return detailedBooking;
            } catch (err) {
              console.log(`No invoice data for booking ${booking.id}`);
              return booking;
            }
          }
          return booking;
        })
      );
      
      setBookings(bookingsWithInvoices);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (bookingId: number, invoiceData: any) => {
    try {
      // Create invoice object with proper structure for InvoicePreview component
      const invoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoiceNumber,
        serviceAmount: invoiceData.serviceAmount || 0,
        partsAmount: invoiceData.partsAmount || 0,
        totalAmount: invoiceData.totalAmount,
        generatedAt: invoiceData.generatedAt,
        booking: {
          id: bookingId,
          customerName: bookings.find(b => b.id === bookingId)?.customerName || '',
          customerEmail: bookings.find(b => b.id === bookingId)?.customerEmail || '',
          serviceName: bookings.find(b => b.id === bookingId)?.serviceName || '',
          vehiclePlateNo: bookings.find(b => b.id === bookingId)?.vehiclePlateNo || '',
          vehicleBrand: bookings.find(b => b.id === bookingId)?.vehicleBrand || '',
          vehicleModel: bookings.find(b => b.id === bookingId)?.vehicleModel || ''
        }
      };
      setSelectedInvoice(invoice);
      setShowInvoicePreview(true);
    } catch (err: any) {
      console.error('Failed to prepare invoice data:', err);
      setError(err?.message || 'Failed to load invoice');
    }
  };

  const handlePayInvoice = async (bookingId: number, invoiceData: any) => {
    try {
      // Create invoice object with proper structure for InvoicePaymentModal component
      const invoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoiceNumber,
        serviceAmount: invoiceData.serviceAmount || 0,
        partsAmount: invoiceData.partsAmount || 0,
        totalAmount: invoiceData.totalAmount,
        generatedAt: invoiceData.generatedAt,
        booking: {
          id: bookingId,
          customerName: bookings.find(b => b.id === bookingId)?.customerName || '',
          customerEmail: bookings.find(b => b.id === bookingId)?.customerEmail || '',
          serviceName: bookings.find(b => b.id === bookingId)?.serviceName || '',
          vehiclePlateNo: bookings.find(b => b.id === bookingId)?.vehiclePlateNo || '',
          vehicleBrand: bookings.find(b => b.id === bookingId)?.vehicleBrand || '',
          vehicleModel: bookings.find(b => b.id === bookingId)?.vehicleModel || ''
        }
      };
      setSelectedInvoice(invoice);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error('Failed to prepare invoice data:', err);
      setError(err?.message || 'Failed to load invoice');
    }
  };

  const handleCloseModals = () => {
    setSelectedInvoice(null);
    setShowInvoicePreview(false);
    setShowPaymentModal(false);
  };

  const handlePaymentComplete = () => {
    // Refresh bookings to get updated payment status
    fetchBookings();
    // Close modals
    handleCloseModals();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Filter and sort bookings based on active tab
  const getFilteredBookings = () => {
    const filtered = bookings.filter(booking => {
      switch (activeTab) {
        case 'active': 
          return ['CONFIRMED', 'IN_PROGRESS'].includes(booking.status);
        case 'pending': 
          return booking.status === 'PENDING';
        case 'completed': 
          return booking.status === 'COMPLETED';
        default: 
          return true; // all
      }
    });
    
    // Sort by createdAt descending (latest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Get count for each tab
  const getTabCounts = () => {
    const all = bookings.length;
    const active = bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    
    return { all, active, pending, completed };
  };

  const filteredBookings = getFilteredBookings();
  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Main Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Track your service appointments and their progress</p>
      </div>
        {/* Navigation Tabs */}
        <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 All ({tabCounts.all})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚡ Active ({tabCounts.active})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏳ Pending ({tabCounts.pending})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Completed ({tabCounts.completed})
          </button>
        </div>
        
        {/* Filter Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} 
            {activeTab !== 'all' && ` in ${activeTab} status`}
          </span>
          <span className="text-xs">
            📅 Sorted by newest first
          </span>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by booking a service for your motorcycle.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/services')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Book a Service
            </button>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any bookings with {activeTab} status.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{booking.serviceName}</h3>
                  <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{booking.serviceCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-gray-900">${booking.serviceBasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">{Math.floor(booking.serviceEstimatedDurationMinutes / 60)}h {booking.serviceEstimatedDurationMinutes % 60}m</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="text-gray-900">{formatDateTime(booking.scheduledDateTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="text-gray-900">{booking.vehiclePlateNo} - {booking.vehicleBrand} {booking.vehicleModel}</span>
                    </div>
                    {booking.assignedMechanicName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mechanic:</span>
                        <span className="text-gray-900">{booking.assignedMechanicName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Progress Timeline</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${booking.createdAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Booked</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Confirmed</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${['IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">In Progress</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${booking.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Completed</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                <div>
                  <span className="block font-medium">Booked</span>
                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
                {booking.startedAt && (
                  <div>
                    <span className="block font-medium">Started</span>
                    <span>{new Date(booking.startedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {booking.completedAt && (
                  <div>
                    <span className="block font-medium">Completed</span>
                    <span>{new Date(booking.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Invoice & Payment Section */}
              {booking.status === 'COMPLETED' && booking.invoice && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Invoice & Payment</h4>
                      <p className="text-sm text-gray-600">Invoice #{booking.invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">${booking.invoice.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total amount</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {booking.invoice.invoicePayment ? (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.invoice.invoicePayment.status)}`}>
                          {booking.invoice.invoicePayment.status.replace('_', ' ')}
                        </span>
                      </div>
                      {booking.invoice.invoicePayment.status === 'REJECTED' && booking.invoice.invoicePayment.receipt?.adminNotes && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {booking.invoice.invoicePayment.receipt.adminNotes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600`}>
                        Payment not initiated
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewInvoice(booking.id, booking.invoice)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium flex items-center gap-1"
                    >
                      📄 View Invoice
                    </button>
                    
                    {!booking.invoice.invoicePayment && (
                      <button
                        onClick={() => handlePayInvoice(booking.id, booking.invoice)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                      >
                        💳 Pay Invoice
                      </button>
                    )}
                    
                    {booking.invoice.invoicePayment && 
                     (booking.invoice.invoicePayment.status === 'PENDING' || booking.invoice.invoicePayment.status === 'REJECTED') && (
                      <button
                        onClick={() => handlePayInvoice(booking.id, booking.invoice)}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium flex items-center gap-1"
                      >
                        📤 Upload Receipt
                      </button>
                    )}

                    {booking.invoice.invoicePayment?.status === 'APPROVED' && (
                      <div className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium flex items-center gap-1">
                        ✅ Payment Confirmed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Navigation Back */}
      <div className="mt-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Modals */}
      {selectedInvoice && showInvoicePreview && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={handleCloseModals}
        />
      )}

      {selectedInvoice && showPaymentModal && (
        <InvoicePaymentModal
          invoice={selectedInvoice}
          isOpen={showPaymentModal}
          onClose={handleCloseModals}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}