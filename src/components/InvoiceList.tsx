import React from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { format } from 'date-fns';
import { Download, Send, FileText, AlertCircle } from 'lucide-react';
import { BaseInvoice, InvoiceStatus, InvoiceType } from '../types/accounting';

interface Props {
  type?: InvoiceType;
  onGenerateNew?: () => void;
  generateButtonText?: string;
}

export default function InvoiceList({ type, onGenerateNew, generateButtonText }: Props) {
  const { invoices, loading, updateStatus } = useInvoices(type);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {type ? `${type} Invoices` : 'All Invoices'}
        </h2>
        {onGenerateNew && (
          <button
            onClick={onGenerateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            {generateButtonText || 'Generate Invoice'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InvoiceStatus status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <InvoiceActions 
                    invoice={invoice} 
                    onUpdateStatus={(status) => updateStatus(invoice.id, status)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceStatus({ status }: { status: InvoiceStatus }) {
  const styles = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    VOID: 'bg-red-100 text-red-800',
    OVERDUE: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InvoiceActions({ 
  invoice, 
  onUpdateStatus 
}: { 
  invoice: BaseInvoice;
  onUpdateStatus: (status: InvoiceStatus) => void;
}) {
  return (
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
          onClick={() => onUpdateStatus('SENT')}
          className="text-gray-400 hover:text-gray-500"
          title="Send Invoice"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
      {invoice.status === 'SENT' && (
        <button
          onClick={() => onUpdateStatus('PAID')}
          className="text-green-400 hover:text-green-500"
          title="Mark as Paid"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}