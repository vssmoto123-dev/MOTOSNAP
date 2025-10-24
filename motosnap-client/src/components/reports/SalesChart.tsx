'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SalesReport } from '@/types/reports';
import { forwardRef } from 'react';
import './ChartFixes.css';

interface SalesChartProps {
  data: SalesReport[];
  period: 'daily' | 'weekly' | 'monthly';
}

export const SalesChart = forwardRef<HTMLDivElement, SalesChartProps>(
  ({ data, period }, ref) => {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Report ({period})</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No sales data available for the selected period.</p>
        </div>
      </div>
    );
  }

  const formatXAxisLabel = (value: any): string => {
    if (period === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[value - 1] || '';
    } else if (period === 'weekly') {
      return `Week ${value}`;
    } else {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const processedData = data.map(item => ({
    ...item,
    periodLabel: period === 'monthly'
      ? `${formatXAxisLabel(item.month || 1)} ${item.year || 2024}`
      : period === 'weekly'
      ? formatXAxisLabel(item.week || 1)
      : formatXAxisLabel(item.date || new Date().toISOString())
  })).reverse(); // Reverse to show chronological order

  return (
    <div ref={ref} className="bg-white p-6 rounded-lg shadow" id="sales-chart">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Report ({period})</h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sales data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="periodLabel"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              name="Total Revenue"
              dot={{ fill: '#2563eb', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="serviceRevenue"
              stroke="#059669"
              strokeWidth={2}
              name="Service Revenue"
              dot={{ fill: '#059669', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="partsRevenue"
              stroke="#d97706"
              strokeWidth={2}
              name="Parts Revenue"
              dot={{ fill: '#d97706', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Service Revenue</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.serviceRevenue, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Parts Revenue</p>
              <p className="text-lg font-semibold text-amber-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.partsRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SalesChart.displayName = 'SalesChart';