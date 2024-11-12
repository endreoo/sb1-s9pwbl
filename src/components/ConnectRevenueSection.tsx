import React, { useState } from 'react';
import { useConnectRevenue } from '../hooks/useConnectRevenue';
import { Plus, Building2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { ConnectClient } from '../types/accounting';

export default function ConnectRevenueSection() {
  const {
    clients,
    revenues,
    loading,
    addClient,
    recordRevenue,
    getClientStats,
    updateClientStatus
  } = useConnectRevenue();

  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewRevenue, setShowNewRevenue] = useState(false);

  if (loading) return <div>Loading...</div>;

  const totalCommission = revenues.reduce(
    (sum, r) => sum.plus(r.commission),
    new Decimal(0)
  );

  const totalGrossBookings = revenues.reduce(
    (sum, r) => sum.plus(r.grossBookings),
    new Decimal(0)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Connect Revenue Management</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowNewClient(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Building2 className="w-4 h-4 mr-2" />
            New Client
          </button>
          <button
            onClick={() => setShowNewRevenue(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Revenue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Commission"
          value={totalCommission.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Total Gross Bookings"
          value={totalGrossBookings.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Active Clients"
          value={clients.filter(c => c.status === 'ACTIVE').length.toString()}
          type="number"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {revenues.map((revenue) => {
              const client = clients.find(c => c.id === revenue.clientId);
              return (
                <tr key={revenue.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(revenue.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${revenue.grossBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client?.commissionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${revenue.commission}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onSave={addClient}
        />
      )}

      {showNewRevenue && (
        <NewRevenueModal
          onClose={() => setShowNewRevenue(false)}
          onSave={recordRevenue}
          clients={clients}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, type }: {
  title: string;
  value: string;
  type: 'currency' | 'number';
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">
        {type === 'currency' ? `$${value}` : value}
      </p>
    </div>
  );
}

function NewClientModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (client: Omit<ConnectClient, 'id' | 'status'>) => void;
}) {
  const [client, setClient] = useState({
    name: '',
    commissionRate: '',
    startDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: client.name,
      commissionRate: Number(client.commissionRate),
      startDate: client.startDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">New Connect Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              value={client.name}
              onChange={e => setClient({ ...client, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Commission Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={client.commissionRate}
              onChange={e => setClient({ ...client, commissionRate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={client.startDate}
              onChange={e => setClient({ ...client, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewRevenueModal({
  onClose,
  onSave,
  clients
}: {
  onClose: () => void;
  onSave: (clientId: number, grossBookings: string, date: string) => void;
  clients: ConnectClient[];
}) {
  const [revenue, setRevenue] = useState({
    clientId: '',
    grossBookings: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      Number(revenue.clientId),
      revenue.grossBookings,
      revenue.date
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Record Connect Revenue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <select
              value={revenue.clientId}
              onChange={e => setRevenue({ ...revenue, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.commissionRate}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gross Bookings
            </label>
            <input
              type="number"
              step="0.01"
              value={revenue.grossBookings}
              onChange={e => setRevenue({ ...revenue, grossBookings: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={revenue.date}
              onChange={e => setRevenue({ ...revenue, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Record Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}