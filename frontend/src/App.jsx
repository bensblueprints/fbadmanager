import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import AdSets from './pages/AdSets';
import Insights from './pages/Insights';
import Audiences from './pages/Audiences';
import AccountSelector from './components/AccountSelector';

const API = '/api/meta';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/insights', label: 'Insights' },
  { to: '/audiences', label: 'Audiences' },
];

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetch(`${API}/accounts`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || [];
        setAccounts(list);
        if (list.length > 0) setSelectedAccount(list[0].account_id);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-600">FB Ad Manager</h1>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <AccountSelector
          accounts={accounts}
          selected={selectedAccount}
          onChange={setSelectedAccount}
        />
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {selectedAccount ? (
          <Routes>
            <Route path="/" element={<Dashboard accountId={selectedAccount} />} />
            <Route path="/campaigns" element={<Campaigns accountId={selectedAccount} />} />
            <Route path="/campaigns/:campaignId/adsets" element={<AdSets />} />
            <Route path="/insights" element={<Insights accountId={selectedAccount} />} />
            <Route path="/audiences" element={<Audiences accountId={selectedAccount} />} />
          </Routes>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {accounts.length === 0 ? 'Loading ad accounts...' : 'Select an ad account to get started.'}
          </div>
        )}
      </main>
    </div>
  );
}
