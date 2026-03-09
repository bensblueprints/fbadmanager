import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';

const API = '/api/meta';

export default function Audiences({ accountId }) {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null); // 'custom' | 'lookalike' | null
  const [form, setForm] = useState({ name: '', description: '', subtype: 'CUSTOM', source: '', country: 'US', ratio: '1' });

  const loadAudiences = () => {
    setLoading(true);
    fetch(`${API}/accounts/${accountId}/audiences`)
      .then((r) => r.json())
      .then((d) => setAudiences(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (accountId) loadAudiences(); }, [accountId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const body = showForm === 'lookalike'
      ? {
          name: form.name,
          subtype: 'LOOKALIKE',
          origin_audience_id: form.source,
          lookalike_spec: JSON.stringify({
            type: 'custom_ratio',
            ratio: Number(form.ratio) / 100,
            country: form.country,
          }),
        }
      : {
          name: form.name,
          subtype: 'CUSTOM',
          description: form.description,
          customer_file_source: 'USER_PROVIDED_ONLY',
        };

    await fetch(`${API}/accounts/${accountId}/audiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setShowForm(null);
    setForm({ name: '', description: '', subtype: 'CUSTOM', source: '', country: 'US', ratio: '1' });
    loadAudiences();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'subtype', label: 'Type' },
    {
      key: 'approximate_count_lower_bound',
      label: 'Approx Size',
      render: (v, row) => {
        const lo = v ? Number(v).toLocaleString() : '?';
        const hi = row.approximate_count_upper_bound ? Number(row.approximate_count_upper_bound).toLocaleString() : '?';
        return `${lo} - ${hi}`;
      },
    },
    {
      key: 'delivery_status',
      label: 'Status',
      render: (v) => v?.status || '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Audiences</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm('custom')}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Custom Audience
          </button>
          <button
            onClick={() => setShowForm('lookalike')}
            className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Lookalike Audience
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold mb-3">
            {showForm === 'custom' ? 'Create Custom Audience' : 'Create Lookalike Audience'}
          </h3>
          <form onSubmit={handleCreate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            {showForm === 'custom' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Audience ID</label>
                  <input
                    required
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Existing audience ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ratio (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.ratio}
                      onChange={(e) => setForm({ ...form, ratio: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <DataTable columns={columns} rows={audiences} />
      )}
    </div>
  );
}
