import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import DateRangePicker from '../components/DateRangePicker';
import DataTable from '../components/DataTable';

const API = '/api/meta';

const BREAKDOWNS = [
  { label: 'None', value: '' },
  { label: 'Age', value: 'age' },
  { label: 'Gender', value: 'gender' },
  { label: 'Platform', value: 'publisher_platform' },
  { label: 'Device', value: 'device_platform' },
  { label: 'Country', value: 'country' },
];

export default function Insights({ accountId }) {
  const [datePreset, setDatePreset] = useState('last_7d');
  const [breakdown, setBreakdown] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    const params = new URLSearchParams({ date_preset: datePreset });
    if (breakdown) params.set('breakdowns', breakdown);
    fetch(`${API}/accounts/${accountId}/insights?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId, datePreset, breakdown]);

  const summary = data[0] || {};

  const columns = [
    ...(breakdown ? [{ key: breakdown, label: breakdown.charAt(0).toUpperCase() + breakdown.slice(1).replace('_', ' ') }] : []),
    { key: 'spend', label: 'Spend', render: (v) => v ? `$${Number(v).toFixed(2)}` : '-' },
    { key: 'impressions', label: 'Impressions', render: (v) => v ? Number(v).toLocaleString() : '-' },
    { key: 'clicks', label: 'Clicks', render: (v) => v ? Number(v).toLocaleString() : '-' },
    { key: 'ctr', label: 'CTR', render: (v) => v ? `${Number(v).toFixed(2)}%` : '-' },
    { key: 'cpc', label: 'CPC', render: (v) => v ? `$${Number(v).toFixed(2)}` : '-' },
    { key: 'cpm', label: 'CPM', render: (v) => v ? `$${Number(v).toFixed(2)}` : '-' },
    { key: 'reach', label: 'Reach', render: (v) => v ? Number(v).toLocaleString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Insights</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <DateRangePicker selected={datePreset} onSelect={setDatePreset} />
        <select
          value={breakdown}
          onChange={(e) => setBreakdown(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
        >
          {BREAKDOWNS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          {!breakdown && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Spend" value={`$${summary.spend || '0.00'}`} />
              <StatsCard label="Impressions" value={Number(summary.impressions || 0).toLocaleString()} />
              <StatsCard label="Clicks" value={Number(summary.clicks || 0).toLocaleString()} />
              <StatsCard label="CTR" value={summary.ctr ? `${Number(summary.ctr).toFixed(2)}%` : '0.00%'} />
            </div>
          )}

          <DataTable
            columns={columns}
            rows={data.map((d, i) => ({ id: d[breakdown] || i, ...d }))}
          />
        </>
      )}
    </div>
  );
}
