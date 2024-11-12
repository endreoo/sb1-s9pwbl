import React, { useState } from 'react';
import { useGrowRevenue } from '../hooks/useGrowRevenue';
import { Plus, Building2, Package } from 'lucide-react';
import { format } from 'date-fns';
import Decimal from 'decimal.js';

export default function GrowRevenueSection() {
  const { 
    products, 
    clients, 
    revenues, 
    loading,
    addProduct,
    addClient,
    recordRevenue,
    getClientStats
  } = useGrowRevenue();

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewRevenue, setShowNewRevenue] = useState(false);

  if (loading) return <div>Loading...</div>;

  const totalRevenue = revenues.reduce(
    (sum, r) => sum.plus(r.totalAmount), 
    new Decimal(0)
  );

  const activeClients = clients.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grow Revenue Management</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowNewProduct(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
          >
            <Package className="w-4 h-4 mr-2" />
            New Product
          </button>
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
          title="Total Revenue"
          value={totalRevenue.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Active Clients"
          value={activeClients.toString()}
          type="number"
        />
        <StatCard
          title="Active Products"
          value={products.filter(p => p.isActive).length.toString()}
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
                License Fees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {revenues.map((revenue) => {
              const client = clients.find(c => c.id === revenue.clientId);
              const totalFees = revenue.licenseFees.reduce(
                (sum, fee) => sum.plus(fee.amount), 
                new Decimal(0)
              );

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
                    ${totalFees.toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${revenue.totalAmount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNewProduct && (
        <NewProductModal
          onClose={() => setShowNewProduct(false)}
          onSave={addProduct}
        />
      )}

      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onSave={addClient}
          products={products}
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

// ... Modal components implementation follows the same pattern as ProsperRevenueSection
// with appropriate fields for products, clients, and revenue recording