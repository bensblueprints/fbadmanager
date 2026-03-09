export default function AccountSelector({ accounts, selected, onChange }) {
  if (!accounts.length) return null;
  return (
    <select
      value={selected || ''}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
    >
      {accounts.map((a) => (
        <option key={a.account_id} value={a.account_id}>
          {a.name || `Account ${a.account_id}`}
        </option>
      ))}
    </select>
  );
}
