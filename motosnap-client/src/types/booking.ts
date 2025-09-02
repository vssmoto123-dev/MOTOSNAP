export interface BookingRequest {
  serviceId: number;
  vehicleId: number;
  scheduledDateTime: string;
  notes?: string;
}

export interface BookingResponse {
  id: number;
  scheduledDateTime: string;
  status: BookingStatus;
  notes?: string;
  
  // Service information
  serviceId: number;
  serviceName: string;
  serviceCategory: string;
  serviceDescription?: string;
  serviceBasePrice: number;
  serviceEstimatedDurationMinutes: number;
  
  // Vehicle information
  vehicleId: number;
  vehiclePlateNo: string;
  vehicleModel: string;
  vehicleBrand: string;
  vehicleYear: number;
  
  // Customer information
  customerId: number;
  customerName: string;
  customerEmail: string;
  
  // Mechanic information (if assigned)
  assignedMechanicId?: number;
  assignedMechanicName?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED' 
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingStatusUpdateRequest {
  status: BookingStatus;
  assignedMechanicId?: number;
  statusNotes?: string;
}