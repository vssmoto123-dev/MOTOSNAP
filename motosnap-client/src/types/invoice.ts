export interface Invoice {
  id: number;
  invoiceNumber: string;
  serviceAmount: number;
  partsAmount: number;
  totalAmount: number;
  pdfUrl?: string;
  booking: {
    id: number;
    serviceName: string;
    customerName: string;
    customerEmail: string;
    vehiclePlateNo: string;
    vehicleBrand: string;
    vehicleModel: string;
    assignedMechanicName: string;
    scheduledDateTime: string;
    completedAt?: string;
    notes?: string;
    statusNotes?: string;
  };
  generatedAt: string;
}

export interface InvoiceRequest {
  bookingId: number;
}

export interface InvoicePdfUrlUpdateRequest {
  pdfUrl: string;
}

export interface MonthlyRevenueData {
  month: number;
  year: number;
  revenue: number;
}