import React, { useState } from 'react';
import { CreditCard, Plus, MoreVertical } from 'lucide-react';

export default function VirtualCards() {
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Virtual Cards</h1>
        <button
          onClick={() => setShowNewCardModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <VirtualCard key={i} />
        ))}
      </div>

      {showNewCardModal && (
        <NewCardModal onClose={() => setShowNewCardModal(false)} />
      )}
    </div>
  );
}

function VirtualCard() {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white relative">
      <div className="absolute top-4 right-4">
        <button className="text-white/80 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-8">
        <CreditCard className="w-10 h-10 mb-4" />
        <p className="text-lg font-medium">**** **** **** 4242</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-white/80">Balance</p>
          <p className="text-lg font-semibold">$12,000.00</p>
        </div>
        <div>
          <p className="text-sm text-white/80">Expires</p>
          <p className="text-lg font-semibold">12/24</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm text-white/80">Status</p>
        <p className="text-sm font-medium flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
          Active
        </p>
      </div>
    </div>
  );
}

function NewCardModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Virtual Card</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Balance
            </label>
            <input
              type="number"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Card purpose"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}