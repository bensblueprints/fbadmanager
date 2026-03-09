import { useState, useEffect } from 'react';

const API = '/api/meta';

export default function Settings({ onTokenChange }) {
  const [accessToken, setAccessToken] = useState('');
  const [appId, setAppId] = useState('');
  const [current, setCurrent] = useState({ access_token: '', app_id: '', access_token_set: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then(setCurrent)
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const body = {};
      if (accessToken) body.access_token = accessToken;
      if (appId) body.app_id = appId;
      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Settings saved! Token is active.');
        setAccessToken('');
        setAppId('');
        // Refresh current display
        const updated = await fetch(`${API}/settings`).then((r) => r.json());
        setCurrent(updated);
        onTokenChange?.();
      }
    } catch {
      setMessage('Failed to save settings.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-800">Meta API Credentials</h3>
        <p className="text-sm text-gray-500">
          Enter your Meta access token and app ID. These are stored in memory on the server and used for all API calls.
          Swap them anytime to manage different ad accounts.
        </p>

        {/* Current status */}
        <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Token Status</span>
            <span className={current.access_token_set ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
              {current.access_token_set ? 'Active' : 'Not Set'}
            </span>
          </div>
          {current.access_token_set && (
            <div className="flex justify-between">
              <span className="text-gray-500">Current Token</span>
              <span className="text-gray-700 font-mono text-xs">{current.access_token}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">App ID</span>
            <span className="text-gray-700 font-mono text-xs">{current.app_id || 'Not set'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
            <textarea
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              rows={3}
              placeholder="EAAKJuvYZBJb..."
            />
            <p className="text-xs text-gray-400 mt-1">Paste your full Meta access token. Leave blank to keep current.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
            <input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              placeholder="1367190391759798"
            />
            <p className="text-xs text-gray-400 mt-1">Your Meta app ID. Leave blank to keep current.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || (!accessToken && !appId)}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && (
              <span className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
