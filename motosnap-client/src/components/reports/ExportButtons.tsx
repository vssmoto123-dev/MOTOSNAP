'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SalesReport, PartsUsageReport, MechanicPerformance } from '@/types/reports';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

interface ExportButtonsProps {
  salesData: SalesReport[];
  partsData: PartsUsageReport[];
  mechanicData: MechanicPerformance[];
  period: string;
}

export function ExportButtons({ salesData, partsData, mechanicData, period }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const captureChart = async (elementId: string, name: string): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Chart element not found: ${elementId}`);
      return '';
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution for quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        // Add color parsing fixes
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Add the chart export fix class
            clonedElement.classList.add('chart-export-fix');

            // Replace any problematic color values with simple hex colors
            const styleElement = clonedDoc.createElement('style');
            styleElement.textContent = `
              #${elementId} {
                background-color: #ffffff !important;
              }
              #${elementId} * {
                color: #000000 !important;
                background-color: #ffffff !important;
                border-color: #e5e7eb !important;
              }
              #${elementId} .recharts-text {
                fill: #000000 !important;
              }
              #${elementId} .recharts-cartesian-axis-tick-line {
                stroke: #9ca3af !important;
              }
              #${elementId} .recharts-cartesian-axis-line {
                stroke: #9ca3af !important;
              }
              #${elementId} .recharts-tooltip-wrapper {
                background-color: #ffffff !important;
                border: 1px solid #e5e7eb !important;
                color: #000000 !important;
              }
              #${elementId} .recharts-legend-item-text {
                fill: #000000 !important;
              }
              #${elementId} .recharts-legend-wrapper {
                color: #000000 !important;
              }
            `;
            clonedDoc.head.appendChild(styleElement);
          }
        }
      });

      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error(`Failed to capture ${name} chart:`, error);
      // Fallback: try with simpler settings
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 1, // Lower resolution
          useCORS: false,
          allowTaint: false,
          logging: false,
          ignoreElements: (element) => {
            // Ignore potentially problematic elements
            return element.classList?.contains('recharts-tooltip');
          }
        });
        return canvas.toDataURL('image/png', 0.8);
      } catch (fallbackError) {
        console.error(`Fallback capture also failed for ${name}:`, fallbackError);
        return '';
      }
    }
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csv = Papa.unparse({
      fields: headers,
      data: data
    }, {
      quotes: true,
      quoteChar: '"',
      escapeChar: '"'
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesCSV = () => {
    const headers = ['Period', 'Revenue (RM)', 'Service Revenue (RM)', 'Parts Revenue (RM)', 'Order Count'];
    const data = salesData.map(item => [
      item.date || `${item.month}/${item.year}`,
      formatCurrency(item.revenue),
      formatCurrency(item.serviceRevenue),
      formatCurrency(item.partsRevenue),
      item.orderCount
    ]);
    exportToCSV(data, `sales-report-${period}`, headers);
  };

  const exportPartsCSV = () => {
    const headers = ['Part Name', 'Part Code', 'Brand', 'Category', 'Quantity Used', 'Revenue (RM)'];
    const data = partsData.map(item => [
      item.partName,
      item.partCode,
      item.brand || '',
      item.category || '',
      item.totalQuantity,
      formatCurrency(item.totalRevenue)
    ]);
    exportToCSV(data, 'parts-usage-report', headers);
  };

  const exportMechanicCSV = () => {
    const headers = ['Mechanic Name', 'Email', 'Total Jobs', 'Completed Jobs', 'Completion Rate', 'Avg Completion Hours'];
    const data = mechanicData.map(item => [
      item.mechanicName,
      item.mechanicEmail,
      item.totalJobs,
      item.completedJobs,
      `${item.completionRate}%`,
      item.avgCompletionHours || 'N/A'
    ]);
    exportToCSV(data, 'mechanic-performance-report', headers);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 12, x: number = margin) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(String(line), x, yPosition);
          yPosition += 7;
        });
        return yPosition;
      };

      // Helper function to add chart image to PDF
      const addChartToPDF = async (chartDataUrl: string, title: string, description: string) => {
        if (!chartDataUrl) return yPosition;

        // Add title
        doc.setFontSize(16);
        doc.text(title, margin, yPosition);
        yPosition += 10;

        // Add description
        doc.setFontSize(12);
        doc.text(description, margin, yPosition);
        yPosition += 8;

        // Calculate image dimensions
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = 100;

        // Check if we need a new page
        if (yPosition + imgHeight > 270) {
          doc.addPage();
          yPosition = margin;
        }

        // Add chart image to PDF
        doc.addImage(chartDataUrl, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;

        return yPosition;
      };

      // PDF Header
      doc.setFontSize(20);
      doc.text('MOTOSNAP Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      setExportProgress(20);

      // Capture and add charts
      const salesChartUrl = await captureChart('sales-chart', 'Sales Report');
      setExportProgress(30);
      yPosition = await addChartToPDF(salesChartUrl, 'Sales Report', `Sales performance (${period})`);

      const partsChartUrl = await captureChart('parts-chart', 'Parts Usage');
      setExportProgress(50);
      yPosition = await addChartToPDF(partsChartUrl, 'Parts Usage Report', 'Most used parts analysis');

      const mechanicChartUrl = await captureChart('mechanic-chart', 'Mechanic Performance');
      setExportProgress(70);
      yPosition = await addChartToPDF(mechanicChartUrl, 'Mechanic Performance Report', 'Team performance metrics');

      // Add summary section
      if (yPosition > 200) {
        doc.addPage();
        yPosition = margin;
      }

      setExportProgress(80);

      // Summary statistics
      doc.setFontSize(14);
      doc.text('Summary Statistics', margin, yPosition);
      yPosition += 10;

      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = salesData.reduce((sum, item) => sum + item.orderCount, 0);
      const totalBookings = mechanicData.reduce((sum, item) => sum + item.totalJobs, 0);

      const summaryData = [
        `Total Revenue: ${formatCurrency(totalRevenue)}`,
        `Total Orders: ${totalOrders}`,
        `Total Bookings: ${totalBookings}`,
        `Report Period: ${period}`
      ];

      doc.setFontSize(11);
      summaryData.forEach(item => {
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 7;
      });

      setExportProgress(100);

      // Save PDF
      doc.save(`motosnap-report-with-charts-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF with charts:', error);
      alert('Failed to generate PDF with charts. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportSalesCSV} variant="secondary" size="sm">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Sales CSV
      </Button>

      <Button onClick={exportPartsCSV} variant="secondary" size="sm">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Parts CSV
      </Button>

      <Button onClick={exportMechanicCSV} variant="secondary" size="sm">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Mechanic CSV
      </Button>

      <Button onClick={exportToPDF} variant="secondary" size="sm" disabled={isExporting}>
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting... {exportProgress}%
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF with Charts
          </>
        )}
      </Button>
    </div>
  );
}