import React from 'react';
import './styles/UpcomingLeaves.css';

const UpcomingLeaves: React.FC = () => {
  return (
    <div className="upcoming-leaves card">
      <h3>Upcoming Leave/s</h3>
      <table className="upcoming-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="status approved" /> Approved</td>
            <td>Oct 25 - 30, 2025</td>
            <td>Sick</td>
          </tr>
          <tr>
            <td><span className="status approved" /> Approved</td>
            <td>Nov 3 - 5, 2025</td>
            <td>Vacation</td>
          </tr>
          <tr>
            <td><span className="status pending" /> Pending</td>
            <td>Dec 27, 2025 - Jan 3, 2026</td>
            <td>Holiday</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingLeaves;
