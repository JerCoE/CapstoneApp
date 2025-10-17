import '../styles/LeaveRequestCount.css';

export default function LeaveRequestCount({ total = 24, approved = 13 }: { total?: number; approved?: number }) {
  return (
    <div className="leave-count-card">
      <div className="leave-count-header">Total Leave Requests</div>
      <div className="leave-count-sub">Live Monthly Quick Stats</div>
      <div className="leave-count-body">
        <div className="leave-count-row"><span>Pending:</span><strong>{total - approved}</strong></div>
        <div className="leave-count-row"><span>Approved:</span><strong>{approved}</strong></div>
      </div>
    </div>
  );
}
