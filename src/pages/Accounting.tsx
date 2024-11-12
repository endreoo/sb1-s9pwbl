// Previous imports remain the same...

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('transactions');
  const { transactions, loading } = useAccounting();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <div className="flex space-x-3">
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <TabButton
              active={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </TabButton>
            <TabButton
              active={activeTab === 'prosper'}
              onClick={() => setActiveTab('prosper')}
            >
              Prosper Revenue
            </TabButton>
            <TabButton
              active={activeTab === 'grow'}
              onClick={() => setActiveTab('grow')}
            >
              Grow Revenue
            </TabButton>
            <TabButton
              active={activeTab === 'connect'}
              onClick={() => setActiveTab('connect')}
            >
              Connect Revenue
            </TabButton>
            <TabButton
              active={activeTab === 'digitize'}
              onClick={() => setActiveTab('digitize')}
            >
              Digitize Revenue
            </TabButton>
            <TabButton
              active={activeTab === 'invoices'}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </TabButton>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'transactions' && (
            loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading transactions...</p>
              </div>
            ) : (
              <TransactionsTable transactions={transactions} />
            )
          )}
          {activeTab === 'prosper' && <ProsperRevenueSection />}
          {activeTab === 'grow' && <GrowRevenueSection />}
          {activeTab === 'connect' && <ConnectRevenueSection />}
          {activeTab === 'digitize' && <DigitizeRevenueSection />}
          {activeTab === 'invoices' && <InvoiceList />}
        </div>
      </div>
    </div>
  );
}

// Rest of the component remains the same...