import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';

const API = '/api/meta';

export default function AdSets() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [adSets, setAdSets] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/campaigns/${campaignId}`).then((r) => r.json()),
      fetch(`${API}/campaigns/${campaignId}/adsets`).then((r) => r.json()),
    ])
      .then(([camp, sets]) => {
        setCampaign(camp);
        setAdSets(sets.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [campaignId]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await fetch(`${API}/adsets/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          v === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'daily_budget',
      label: 'Daily Budget',
      render: (v) => v ? `$${(Number(v) / 100).toFixed(2)}` : '-',
    },
    { key: 'optimization_goal', label: 'Optimization' },
    {
      key: 'targeting',
      label: 'Targeting',
      render: (v) => {
        if (!v) return '-';
        const parts = [];
        if (v.age_min || v.age_max) parts.push(`Age ${v.age_min || '?'}-${v.age_max || '?'}`);
        if (v.geo_locations?.countries) parts.push(v.geo_locations.countries.join(', '));
        return parts.join(' | ') || 'Custom';
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleStatus(row.id, row.status); }}
          className={`px-2 py-1 text-xs rounded ${
            row.status === 'ACTIVE'
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {row.status === 'ACTIVE' ? 'Pause' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campaigns')} className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Campaigns
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          Ad Sets {campaign ? `— ${campaign.name}` : ''}
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <DataTable columns={columns} rows={adSets} />
      )}
    </div>
  );
}
