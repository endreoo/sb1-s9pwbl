import React, { useState } from 'react';
import { useProsperRevenue } from '../hooks/useProsperRevenue';
import { formatISO } from 'date-fns';
import { PlusCircle, TrendingUp } from 'lucide-react';

export default function ProsperRevenueSection() {
  const { targets, revenues, loading, addTarget, recordRevenue, getMonthlyStats } = useProsperRevenue();
  const [showNewTarget, setShowNewTarget] = useState(false);
  const [showNewRevenue, setShowNewRevenue] = useState(false);

  if (loading) return <div>Loading...</div>;

  const currentMonth = formatISO(new Date(), { representation: 'date' }).substring(0, 7);
  const stats = getMonthlyStats(currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prosper Revenue Management</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowNewTarget(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Target
          </button>
          <button
            onClick={() => setShowNewRevenue(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Record Revenue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Gross"
          value={stats.totalGross.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Commission"
          value={stats.totalCommission.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="License Fees"
          value={stats.totalLicenseFees.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Targets Achieved"
          value={stats.targetsAchieved.toString()}
          type="number"
        />
      </div>

      {showNewTarget && (
        <NewTargetModal
          onClose={() => setShowNewTarget(false)}
          onSave={addTarget}
        />
      )}

      {showNewRevenue && (
        <NewRevenueModal
          onClose={() => setShowNewRevenue(false)}
          onSave={recordRevenue}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
                Target Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {revenues.map((revenue) => (
              <tr key={revenue.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {revenue.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${revenue.grossAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${revenue.commission}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${revenue.licenseFee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      revenue.achieved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {revenue.achieved ? 'Achieved' : 'Not Achieved'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function NewTargetModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (target: any) => void;
}) {
  const [target, setTarget] = useState({
    minAmount: '',
    commissionRate: '',
    licenseFee: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(target);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">New Revenue Target</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Amount
            </label>
            <input
              type="number"
              value={target.minAmount}
              onChange={e => setTarget({ ...target, minAmount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={target.commissionRate}
              onChange={e => setTarget({ ...target, commissionRate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              License Fee
            </label>
            <input
              type="number"
              value={target.licenseFee}
              onChange={e => setTarget({ ...target, licenseFee: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              Save Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewRevenueModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (amount: string, date: string) => void;
}) {
  const [revenue, setRevenue] = useState({
    amount: '',
    date: formatISO(new Date(), { representation: 'date' })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(revenue.amount, revenue.date);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Record Revenue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gross Amount
            </label>
            <input
              type="number"
              value={revenue.amount}
              onChange={e => setRevenue({ ...revenue, amount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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