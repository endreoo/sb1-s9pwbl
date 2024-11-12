import React, { useState } from 'react';
import { useDigitizeRevenue } from '../hooks/useDigitizeRevenue';
import { Plus, Package, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { DigitizeProduct, DigitizeClient } from '../types/accounting';

export default function DigitizeRevenueSection() {
  const {
    products,
    clients,
    revenues,
    loading,
    addProduct,
    addClient,
    recordMonthlyRevenue,
    updateProductFee,
    getClientStats
  } = useDigitizeRevenue();

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewRevenue, setShowNewRevenue] = useState(false);

  if (loading) return <div>Loading...</div>;

  const totalRevenue = revenues.reduce(
    (sum, r) => sum.plus(r.totalAmount),
    new Decimal(0)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Digitize Revenue Management</h2>
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
            Record Monthly Revenue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Monthly Revenue"
          value={totalRevenue.toFixed(2)}
          type="currency"
        />
        <StatCard
          title="Active Clients"
          value={clients.filter(c => c.status === 'ACTIVE').length.toString()}
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
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                    {format(new Date(`${revenue.year}-${revenue.month}-01`), 'MMMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {revenue.products.map(p => {
                      const product = products.find(prod => prod.id === p.productId);
                      return (
                        <div key={p.productId}>
                          {product?.name}: ${p.feeAmount}
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${revenue.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        revenue.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : revenue.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {revenue.status}
                    </span>
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
          onSave={recordMonthlyRevenue}
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

function NewProductModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (product: Omit<DigitizeProduct, 'id' | 'isActive'>) => void;
}) {
  const [product, setProduct] = useState({
    name: '',
    monthlyFee: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">New Digitize Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={product.name}
              onChange={e => setProduct({ ...product, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Fee
            </label>
            <input
              type="number"
              step="0.01"
              value={product.monthlyFee}
              onChange={e => setProduct({ ...product, monthlyFee: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={product.description}
              onChange={e => setProduct({ ...product, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
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
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewClientModal({
  onClose,
  onSave,
  products
}: {
  onClose: () => void;
  onSave: (client: Omit<DigitizeClient, 'id' | 'status' | 'products'>, productIds: number[]) => void;
  products: DigitizeProduct[];
}) {
  const [client, setClient] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    selectedProducts: [] as number[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name: client.name,
        startDate: client.startDate
      },
      client.selectedProducts
    );
    onClose();
  };

  const toggleProduct = (productId: number) => {
    setClient(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">New Digitize Client</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products
            </label>
            <div className="space-y-2">
              {products.map(product => (
                <label key={product.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={client.selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    {product.name} (${product.monthlyFee}/month)
                  </span>
                </label>
              ))}
            </div>
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
              disabled={client.selectedProducts.length === 0}
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
  onSave: (clientId: number, month: string, year: string) => void;
  clients: DigitizeClient[];
}) {
  const [revenue, setRevenue] = useState({
    clientId: '',
    period: format(new Date(), 'yyyy-MM')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month] = revenue.period.split('-');
    onSave(Number(revenue.clientId), month, year);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Record Monthly Revenue</h2>
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
              {clients
                .filter(c => c.status === 'ACTIVE')
                .map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))
              }
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Period
            </label>
            <input
              type="month"
              value={revenue.period}
              onChange={e => setRevenue({ ...revenue, period: e.target.value })}
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