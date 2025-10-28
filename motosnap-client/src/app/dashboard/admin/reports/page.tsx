'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { SalesReport, PartsUsageReport, MechanicPerformance, DashboardData } from '@/types/reports';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import { SalesChart } from '@/components/reports/SalesChart';
import { PartsUsageChart } from '@/components/reports/PartsUsageChart';
import { MechanicPerformanceChart } from '@/components/reports/MechanicPerformanceChart';
import { ExportButtons } from '@/components/reports/ExportButtons';

export default function ReportsManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Chart refs for export functionality
  const salesChartRef = useRef<HTMLDivElement>(null);
  const partsChartRef = useRef<HTMLDivElement>(null);
  const mechanicChartRef = useRef<HTMLDivElement>(null);

  // Report data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [reportDays, setReportDays] = useState(30);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      // Backend now returns properly typed DTOs that match our TypeScript interfaces
      const data: DashboardData = await apiClient.getDashboardData(reportDays);

      setDashboardData(data);
    } catch (err: unknown) {
      console.error('Failed to fetch dashboard data:', err);
      const errorMsg = err && typeof err === 'object' && 'error' in err
        ? (err as {error: string}).error
        : 'Failed to load reports data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    setLoading(true);
    await fetchDashboardData();
    setSuccess('Reports refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const fetchSalesReport = async () => {
    try {
      setError(null);
      // Backend now returns properly typed SalesReportDTOs
      const salesData: SalesReport[] = await apiClient.getSalesReport(salesPeriod, reportDays);

      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          monthlySales: salesData
        });
      }
    } catch (err: unknown) {
      console.error('Failed to fetch sales report:', err);
      const errorMsg = err && typeof err === 'object' && 'error' in err
        ? (err as {error: string}).error
        : 'Failed to load sales report';
      setError(errorMsg);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (dashboardData) {
      fetchSalesReport();
    }
  }, [salesPeriod, reportDays]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            View sales, parts usage, and mechanic performance reports.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <Button
            onClick={refreshReports}
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Refresh Reports
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Report Period
            </label>
            <Select
              value={salesPeriod}
              onChange={(e) => setSalesPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period (Days)
            </label>
            <Select
              value={reportDays.toString()}
              onChange={(e) => setReportDays(parseInt(e.target.value))}
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
                { value: '365', label: 'Last year' }
              ]}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={refreshReports} variant="secondary" loading={loading}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {dashboardData?.summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(dashboardData.summary.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.summary.totalOrders.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.summary.totalBookings.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Period</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.summary.period}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Export Buttons */}
      {!loading && dashboardData && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Export Reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                Download reports in PDF or CSV format for offline analysis.
              </p>
            </div>
            <ExportButtons
              salesData={dashboardData.monthlySales || []}
              partsData={dashboardData.mostUsedParts || []}
              mechanicData={dashboardData.mechanicPerformance || []}
              period={`${salesPeriod} (${reportDays} days)`}
            />
          </div>
        </div>
      )}

      {/* Reports Content */}
      {!loading && dashboardData && (
        <div className="space-y-6">
          {/* Sales Report Chart */}
          <SalesChart
            ref={salesChartRef}
            data={dashboardData.monthlySales || []}
            period={salesPeriod}
          />

          {/* Parts Usage Chart */}
          <PartsUsageChart
            ref={partsChartRef}
            data={dashboardData.mostUsedParts || []}
          />

          {/* Mechanic Performance Chart */}
          <MechanicPerformanceChart
            ref={mechanicChartRef}
            data={dashboardData.mechanicPerformance || []}
          />
        </div>
      )}
    </div>
  );
}