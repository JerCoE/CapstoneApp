import '../styles/LeaveTypeInsights.css';

type Insight = {
  id: string;
  label: string;
  color: string;
  count: number;
};

const sample: Insight[] = [
  { id: '1', label: 'Holiday Leave', color: '#9b59b6', count: 25 },
  { id: '2', label: 'Birthday Leave', color: '#f5a623', count: 25 },
  { id: '3', label: 'Sick Leave', color: '#e74c3c', count: 25 },
  { id: '4', label: 'Vacation Leave', color: '#4CAF50', count: 25 },
  { id: '5', label: 'Parental Leave', color: '#4fc3f7', count: 25 },
];

export default function LeaveTypeInsights({ items = sample }: { items?: Insight[] }) {
  return (
    <aside className="insights-card">
      <div className="insights-header">Leave Type Insights</div>
      <div className="insights-list">
        {items.map((it) => (
          <div className="insight-row" key={it.id}>
            <div className="insight-left">
              <span className="insight-dot" style={{ background: it.color }} />
              <div className="insight-label">{it.label}</div>
            </div>
            <div className="insight-right">
              <div className="insight-count">Total requests: <strong>{it.count}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
