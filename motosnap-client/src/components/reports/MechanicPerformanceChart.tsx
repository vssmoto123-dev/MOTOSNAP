'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MechanicPerformance as MechanicPerformanceType } from '@/types/reports';
import { forwardRef } from 'react';
import './ChartFixes.css';

interface MechanicPerformanceChartProps {
  data: MechanicPerformanceType[];
}

export const MechanicPerformanceChart = forwardRef<HTMLDivElement, MechanicPerformanceChartProps>(
  ({ data }, ref) => {
  // Ensure data is an array and handle empty/invalid data
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mechanic Performance</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No mechanic performance data available for the selected period.</p>
        </div>
      </div>
    );
  }

  // Take top mechanics for better visualization
  const topMechanics = data.slice(0, 10);

  const processedData = topMechanics.map(item => ({
    name: item.mechanicName && item.mechanicName.length > 15 ? item.mechanicName.substring(0, 15) + '...' : (item.mechanicName || 'Unknown'),
    fullName: item.mechanicName || 'Unknown',
    completedJobs: item.completedJobs || 0,
    totalJobs: item.totalJobs || 0,
    completionRate: item.completionRate || 0,
    avgHours: item.avgCompletionHours || 0
  }));

  return (
    <div ref={ref} className="bg-white p-6 rounded-lg shadow" id="mechanic-chart">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mechanic Performance</h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No mechanic performance data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
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
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'completionRate' ? `${value.toFixed(1)}%` :
                name === 'avgHours' ? `${value.toFixed(1)} hrs` :
                value,
                name === 'completedJobs' ? 'Completed Jobs' :
                name === 'totalJobs' ? 'Total Jobs' :
                name === 'completionRate' ? 'Completion Rate' :
                'Avg Completion Time'
              ]}
              labelFormatter={(label) => {
                const item = processedData.find(p => p.name === label);
                return item ? item.fullName : label;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="completedJobs"
              fill="#2563eb"
              name="Completed Jobs"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="totalJobs"
              fill="#64748b"
              name="Total Jobs"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="completionRate"
              fill="#059669"
              name="Completion Rate"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Performance Summary Table */}
      {data.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Performance Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mechanic</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 5).map((mechanic, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {mechanic.mechanicName}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {mechanic.completedJobs}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {mechanic.totalJobs}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        mechanic.completionRate >= 90
                          ? 'bg-green-100 text-green-800'
                          : mechanic.completionRate >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mechanic.completionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {mechanic.avgCompletionHours ? `${mechanic.avgCompletionHours.toFixed(1)}h` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

MechanicPerformanceChart.displayName = 'MechanicPerformanceChart';