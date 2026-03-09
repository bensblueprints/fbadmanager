import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import DateRangePicker from '../components/DateRangePicker';

const API = '/api/meta';

export default function Dashboard({ accountId }) {
  const [insights, setInsights] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [datePreset, setDatePreset] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/accounts/${accountId}/insights?date_preset=${datePreset}`).then((r) => r.json()),
      fetch(`${API}/accounts/${accountId}/campaigns`).then((r) => r.json()),
    ])
      .then(([ins, camp]) => {
        setInsights(ins.data?.[0] || null);
        setCampaigns(camp.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId, datePreset]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const spend = insights?.spend || '0.00';
  const impressions = insights?.impressions || '0';
  const clicks = insights?.clicks || '0';
  const ctr = insights?.ctr ? `${Number(insights.ctr).toFixed(2)}%` : '0.00%';
  const cpc = insights?.cpc ? `$${Number(insights.cpc).toFixed(2)}` : '$0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <DateRangePicker selected={datePreset} onSelect={setDatePreset} />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard label="Spend" value={`$${spend}`} />
            <StatsCard label="Impressions" value={Number(impressions).toLocaleString()} />
            <StatsCard label="Clicks" value={Number(clicks).toLocaleString()} />
            <StatsCard label="CTR" value={ctr} />
            <StatsCard label="CPC" value={cpc} />
            <StatsCard label="Active Campaigns" value={activeCampaigns} sub={`${campaigns.length} total`} />
          </div>

          {!insights && (
            <p className="text-gray-400 text-center py-8">No data for the selected period.</p>
          )}
        </>
      )}
    </div>
  );
}
