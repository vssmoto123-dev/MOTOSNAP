import { SelectedVariations } from './variations';

// Mechanic parts request types
export interface PartsRequestCreateDTO {
  partId: number;
  quantity: number;
  reason?: string;                          // Optional - why this part is needed
  selectedVariations?: SelectedVariations; // Optional - selected product variations
}

export interface PartsRequestResponseDTO {
  id: number;
  quantity: number;
  status: RequestStatus;
  reason?: string;
  requestedAt: string;
  
  // Part information
  partId: number;
  partName: string;
  partCategory?: string;
  partPrice: number;
  availableStock: number;
  
  // Mechanic information
  mechanicId: number;
  mechanicName: string;
  
  // Booking information
  bookingId: number;
  serviceName: string;
  customerName: string;
  vehiclePlateNo: string;
  
  // Variation information
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string;     // Formatted for UI display
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Mechanic dashboard types
export interface MechanicJobSummary {
  totalJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  pendingRequests: number;                // Parts requests awaiting approval
}

// Parts availability check for mechanics
export interface PartsAvailabilityCheck {
  partId: number;
  selectedVariations?: SelectedVariations;
  requestedQuantity: number;
  available: boolean;
  availableQuantity: number;
  message?: string;
}