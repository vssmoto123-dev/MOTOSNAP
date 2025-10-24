'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PartsUsageReport } from '@/types/reports';
import { forwardRef } from 'react';
import './ChartFixes.css';

interface PartsUsageChartProps {
  data: PartsUsageReport[];
}

export const PartsUsageChart = forwardRef<HTMLDivElement, PartsUsageChartProps>(
  ({ data }, ref) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Ensure data is an array and handle empty/invalid data
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Parts</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No parts usage data available for the selected period.</p>
        </div>
      </div>
    );
  }

  // Take top 10 parts for better visualization
  const topParts = data.slice(0, 10);

  const processedData = topParts.map(item => ({
    partName: item.partName && item.partName.length > 20 ? item.partName.substring(0, 20) + '...' : (item.partName || 'Unknown'),
    fullPartName: item.partName || 'Unknown',
    partCode: item.partCode || 'N/A',
    quantity: item.totalQuantity || 0,
    revenue: item.totalRevenue || 0
  }));

  return (
    <div ref={ref} className="bg-white p-6 rounded-lg shadow" id="parts-chart">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Parts (Top 10)</h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No parts usage data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="partName"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={120}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              yAxisId="left"
              orientation="left"
              stroke="#3b82f6"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'quantity' ? value : formatCurrency(value),
                name === 'quantity' ? 'Quantity Used' : 'Revenue'
              ]}
              labelFormatter={(label) => {
                const item = processedData.find(p => p.partName === label);
                return item ? `${item.fullPartName} (${item.partCode})` : label;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="quantity"
              fill="#2563eb"
              name="Quantity Used"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#059669"
              name="Revenue"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Parts Used</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Parts Revenue</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.totalRevenue, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Unique Parts</p>
              <p className="text-lg font-semibold text-amber-600">
                {data.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PartsUsageChart.displayName = 'PartsUsageChart';