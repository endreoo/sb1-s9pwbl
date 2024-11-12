import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, CreditCard, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Accounting from './pages/Accounting';
import VirtualCards from './pages/VirtualCards';
import Settings from './pages/Settings';
import { initDB } from './db';

function App() {
  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-indigo-600">HotelOnline</h1>
            <p className="text-sm text-gray-500">Accounting System</p>
          </div>
          
          <div className="mt-6">
            <NavLink to="/" icon={<LayoutDashboard />} text="Dashboard" />
            <NavLink to="/accounting" icon={<BookOpen />} text="Accounting" />
            <NavLink to="/virtual-cards" icon={<CreditCard />} text="Virtual Cards" />
            <NavLink to="/settings" icon={<SettingsIcon />} text="Settings" />
          </div>
        </nav>

        <main className="ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/virtual-cards" element={<VirtualCards />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
    >
      <span className="mr-3">{icon}</span>
      {text}
    </Link>
  );
}

export default App;