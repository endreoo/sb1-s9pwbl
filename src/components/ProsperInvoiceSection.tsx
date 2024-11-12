import React, { useState } from 'react';
import { useProsperRevenue } from '../hooks/useProsperRevenue';
import { format, subMonths } from 'date-fns';
import { FileText, Download, Send } from 'lucide-react';
import { ProsperInvoice } from '../types/accounting';

export default function ProsperInvoiceSection() {
  const { getMonthlyStats, generateInvoice, invoices, loading } = useProsperRevenue();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(subMonths(now, 1), 'yyyy-MM'); // Default to previous month
  });

  if (loading) return <div>Loading...</div>;

  const handleGenerateInvoice = () => {
    const [year, month] = selectedMonth.split('-');
    generateInvoice(month, year);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prosper Invoices</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[...Array(12)].map((_, i) => {
              const date = subMonths(new Date(), i);
              const value = format(date, 'yyyy-MM');
              const label = format(date, 'MMMM yyyy');
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <button
            onClick={handleGenerateInvoice}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(`${invoice.year}-${invoice.month}-01`), 'MMMM yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.totalGrossAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.totalCommission}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.totalLicenseFee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InvoiceStatus status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.print()}
                      className="text-gray-400 hover:text-gray-500"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {invoice.status === 'DRAFT' && (
                      <button
                        onClick={() => {/* Handle send */}}
                        className="text-gray-400 hover:text-gray-500"
                        title="Send Invoice"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceStatus({ status }: { status: ProsperInvoice['status'] }) {
  const styles = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}