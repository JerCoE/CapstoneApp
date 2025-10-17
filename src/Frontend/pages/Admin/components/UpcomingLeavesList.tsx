import '../styles/UpcomingLeavesList.css';

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

export default function UpcomingLeavesList({ rows = sampleRows, range = 'January - February' }: { rows?: LeaveRow[]; range?: string }) {
  return (
    <section className="upcoming-list-card">
      <div className="upcoming-header">
        <div className="upcoming-title">
          <h3>Upcoming Leave/s</h3>
          <div className="upcoming-sub">Overview of monthly leaves</div>
        </div>
        <div className="upcoming-range">{range}</div>
      </div>

      <div className="upcoming-table-wrap">
        <table className="upcoming-table">
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
