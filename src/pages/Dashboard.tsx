import React from 'react';
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$124,563.00"
          icon={<DollarSign className="text-green-500" />}
          change="+14.5%"
        />
        <StatCard
          title="Active Cards"
          value="23"
          icon={<CreditCard className="text-blue-500" />}
          change="+2"
        />
        <StatCard
          title="Monthly Growth"
          value="22.4%"
          icon={<TrendingUp className="text-purple-500" />}
          change="+3.2%"
        />
        <StatCard
          title="Pending Actions"
          value="5"
          icon={<AlertCircle className="text-orange-500" />}
          change="-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <CardActivity />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <span className="text-sm text-green-500">{change}</span>
      </div>
    </div>
  );
}

function RecentTransactions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Room Service Payment</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <span className="text-green-500 font-medium">+$243.00</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Virtual Card Activity</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <CreditCard className="text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Card **** 4242</p>
                <p className="text-sm text-gray-500">Used for booking</p>
              </div>
            </div>
            <span className="text-red-500 font-medium">-$1,200.00</span>
          </div>
        ))}
      </div>
    </div>
  );
}