const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last_7d' },
  { label: 'Last 14 Days', value: 'last_14d' },
  { label: 'Last 30 Days', value: 'last_30d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
];

export default function DateRangePicker({ selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onSelect(p.value)}
          className={`px-3 py-1.5 text-sm rounded border ${
            selected === p.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
