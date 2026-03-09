import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import CreateCampaignModal from '../components/CreateCampaignModal';

const API = '/api/meta';

export default function Campaigns({ accountId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const loadCampaigns = () => {
    setLoading(true);
    fetch(`${API}/accounts/${accountId}/campaigns`)
      .then((r) => r.json())
      .then((d) => setCampaigns(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (accountId) loadCampaigns();
  }, [accountId]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await fetch(`${API}/campaigns/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadCampaigns();
  };

  const bulkAction = async (status) => {
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`${API}/campaigns/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      )
    );
    setSelectedIds([]);
    loadCampaigns();
  };

  const handleCreate = async (data) => {
    await fetch(`${API}/accounts/${accountId}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    loadCampaigns();
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
    { key: 'objective', label: 'Objective', render: (v) => v?.replace('OUTCOME_', '') || '-' },
    {
      key: 'daily_budget',
      label: 'Daily Budget',
      render: (v) => v ? `$${(Number(v) / 100).toFixed(2)}` : '-',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleStatus(row.id, row.status)}
            className={`px-2 py-1 text-xs rounded ${
              row.status === 'ACTIVE'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {row.status === 'ACTIVE' ? 'Pause' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <button onClick={() => bulkAction('PAUSED')} className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                Pause Selected
              </button>
              <button onClick={() => bulkAction('ACTIVE')} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                Activate Selected
              </button>
            </>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={campaigns}
          selectable
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => navigate(`/campaigns/${row.id}/adsets`)}
        />
      )}

      {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
