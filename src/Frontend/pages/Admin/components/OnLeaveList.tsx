import '../styles/OnLeaveList.css';

type LeaveRow = {
  id: string;
  type: string;
  name: string;
  from: string;
  to: string;
  days: number;
  department?: string;
};

const sampleRows: LeaveRow[] = [
  { id: '1', type: 'Holiday', name: 'Jeremy Lim', from: '01/22/2025', to: '01/22/2025', days: 1, department: 'Web 1' },
  { id: '2', type: 'Vacation', name: 'Dann Purr', from: '01/22/2025', to: '01/22/2025', days: 5, department: 'Web 1' },
  { id: '3', type: 'Sick', name: 'Jhonelle Ong', from: '01/22/2025', to: '01/22/2025', days: 3, department: 'Web 1' },
  { id: '4', type: 'Parental', name: 'Trix Silong', from: '01/22/2025', to: '01/22/2025', days: 5, department: 'Quality Assurance' },
];

export default function OnLeaveList({ rows = sampleRows, month = 'January' }: { rows?: LeaveRow[]; month?: string }) {
  return (
    <section className="onleave-card">
      <div className="onleave-header">
        <div className="onleave-title">
          <h3>On Leave</h3>
          <div className="onleave-sub">Currently on their scheduled leave period</div>
        </div>
        <div className="onleave-month">{month}</div>
      </div>

      <div className="onleave-table-wrap">
        <table className="onleave-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Name</th>
              <th>Date From</th>
              <th>Date To</th>
              <th>Duration (Days)</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? 'row--alt' : ''}>
                <td>{r.type}</td>
                <td>{r.name}</td>
                <td>{r.from}</td>
                <td>{r.to}</td>
                <td style={{ textAlign: 'center' }}>{r.days}</td>
                <td>{r.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
