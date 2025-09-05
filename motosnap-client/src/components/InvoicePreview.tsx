'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onDownloadPdf?: () => void;
  onEmailInvoice?: () => void;
  onPrint?: () => void;
}

export default function InvoicePreview({
  invoice,
  onClose,
  onDownloadPdf,
  onEmailInvoice,
  onPrint
}: InvoicePreviewProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print behavior
      window.print();
    }
  };

  const handleDownload = async () => {
    if (onDownloadPdf) {
      setIsProcessing(true);
      try {
        await onDownloadPdf();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleEmail = async () => {
    if (onEmailInvoice) {
      setIsProcessing(true);
      try {
        await onEmailInvoice();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
            <p className="text-gray-600 mt-1">Invoice #{invoice.invoiceNumber}</p>
          </div>
          <div className="flex space-x-2">
            {/* Action Buttons */}
            <Button
              onClick={handlePrint}
              variant="secondary"
              size="sm"
              disabled={isProcessing}
              className="text-xs"
            >
              🖨️ Print
            </Button>
            {onDownloadPdf && (
              <Button
                onClick={handleDownload}
                variant="secondary"
                size="sm"
                disabled={isProcessing}
                className="text-xs"
              >
                📥 {isProcessing ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
            {onEmailInvoice && (
              <Button
                onClick={handleEmail}
                variant="secondary"
                size="sm"
                disabled={isProcessing}
                className="text-xs"
              >
                📧 Email Customer
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-0" id="invoice-content">
          {/* Invoice Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MOTOSNAP</h1>
                <p className="text-gray-600 mt-1">Motorcycle Workshop Management</p>
                <p className="text-sm text-gray-500 mt-2">
                  Local Motorcycle Parts at Your Fingertips
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-lg font-semibold text-gray-700">#{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Generated: {formatDate(invoice.generatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{invoice.booking.customerName}</p>
                <p className="text-gray-600">{invoice.booking.customerEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{invoice.booking.vehiclePlateNo}</p>
                <p className="text-gray-600">{invoice.booking.vehicleBrand} {invoice.booking.vehicleModel}</p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium text-gray-900">{invoice.booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mechanic</p>
                  <p className="font-medium text-gray-900">{invoice.booking.assignedMechanicName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed On</p>
                  <p className="font-medium text-gray-900">
                    {invoice.booking.completedAt ? formatDate(invoice.booking.completedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{invoice.booking.serviceName}</div>
                      <div className="text-sm text-gray-500">Base service cost</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-medium text-gray-900">${invoice.serviceAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                  {invoice.partsAmount > 0 && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">Additional Parts</div>
                        <div className="text-sm text-gray-500">Parts used during service</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-medium text-gray-900">${invoice.partsAmount.toFixed(2)}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {(invoice.booking.notes || invoice.booking.statusNotes) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Notes</h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                {invoice.booking.notes && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Customer Notes:</p>
                    <p className="text-sm text-gray-600 mt-1">{invoice.booking.notes}</p>
                  </div>
                )}
                {invoice.booking.statusNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Completion Notes:</p>
                    <p className="text-sm text-gray-600 mt-1">{invoice.booking.statusNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-full max-w-xs">
                <div className="bg-gray-900 text-white rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold">${invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>Thank you for choosing MOTOSNAP for your motorcycle service needs!</p>
            <p className="mt-1">Generated on {formatDateTime(invoice.generatedAt)}</p>
          </div>
        </div>

        {/* Modal Footer - Only visible on screen, not in print */}
        <div className="sticky bottom-0 bg-white border-t p-4 print:hidden">
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="secondary" disabled={isProcessing}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}