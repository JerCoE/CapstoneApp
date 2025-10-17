import React from 'react';
import './QuickStats.css';

export default function QuickStats() {
  return (
    <div className="widget card quick-stats">
      <h4>Quick Stats</h4>
      <div className="stat">Total leaves used: <strong>28</strong></div>
      <div className="stat">Total available: <strong>18</strong></div>
      <div className="stat">Pending Request/s: <strong>3</strong></div>
    </div>
  );
}
;
