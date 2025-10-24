// Report data interfaces following existing invoice.ts patterns

export interface SalesReport {
  date?: string;        // For daily reports
  week?: number;        // For weekly reports
  month?: number;       // For monthly reports (1-12)
  year?: number;        // For monthly reports
  revenue: number;      // Total revenue
  serviceRevenue: number; // Service-only revenue
  partsRevenue: number;   // Parts-only revenue
  orderCount: number;   // Number of orders
}

export interface PartsUsageReport {
  partId: number;
  partName: string;
  partCode: string;
  brand?: string;
  category?: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface MechanicPerformance {
  mechanicId: number;
  mechanicName: string;
  mechanicEmail: string;
  totalJobs: number;
  completedJobs: number;
  avgCompletionHours?: number;
  completionRate: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  period: string;
}

export interface DashboardData {
  monthlySales: SalesReport[];
  mostUsedParts: PartsUsageReport[];
  mechanicPerformance: MechanicPerformance[];
  partsByRevenue: PartsUsageReport[];
  partsByCategory: {
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    uniqueParts: number;
  }[];
  mechanicRevenue: {
    mechanicId: number;
    mechanicName: string;
    mechanicEmail: string;
    completedJobs: number;
    totalRevenue: number;
    avgRevenuePerJob: number;
  }[];
  mechanicPartsRequests: {
    mechanicId: number;
    mechanicName: string;
    mechanicEmail: string;
    totalRequests: number;
    approvedRequests: number;
    totalPartsRequested: number;
    totalPartsApproved: number;
  }[];
  summary: DashboardSummary;
}

export interface ReportRequest {
  period?: 'daily' | 'weekly' | 'monthly';
  days?: number;
}

export interface ReportResponse {
  data: SalesReport[] | PartsUsageReport[] | MechanicPerformance[];
  period: string;
  days: number;
  generatedAt: string;
}