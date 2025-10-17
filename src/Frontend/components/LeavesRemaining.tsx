import './LeavesRemaining.css';

type Leave = {
  id: string;
  label: string;
  used: number;
  total: number;
  color?: string;
};

export default function LeavesRemaining({ leaves, className }: { leaves: Leave[]; className?: string }) {
  return (
    <div className={("card leaves-remaining " + (className ?? '')).trim()}>
      <h3>Available Leaves</h3>
      <div className="subtitle">Your current leave balance for this year</div>
      <div className="card-content">
        <ul className="leave-list">
          {leaves.map((l) => (
            <li key={l.id} className="leave-row">
              <div className="leave-left">
                <span className="dot" style={{ backgroundColor: l.color || '#888' }} />
                <span className="leave-label">{l.label}</span>
              </div>
              <div className="leave-count">{l.used} / {l.total} Days Available</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
