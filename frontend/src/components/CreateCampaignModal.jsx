import { useState } from 'react';

const OBJECTIVES = [
  'OUTCOME_TRAFFIC',
  'OUTCOME_AWARENESS',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_LEADS',
  'OUTCOME_APP_PROMOTION',
  'OUTCOME_SALES',
];

export default function CreateCampaignModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    objective: 'OUTCOME_TRAFFIC',
    daily_budget: '',
    status: 'PAUSED',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({
      ...form,
      daily_budget: form.daily_budget ? String(Number(form.daily_budget) * 100) : undefined,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Create Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="My Campaign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
            <select
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {OBJECTIVES.map((o) => (
                <option key={o} value={o}>{o.replace('OUTCOME_', '')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={form.daily_budget}
              onChange={(e) => setForm({ ...form, daily_budget: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="10.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="PAUSED">Paused</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
