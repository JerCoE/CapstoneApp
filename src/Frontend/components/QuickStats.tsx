import React from 'react';
import './styles/QuickStats.css';

const QuickStats: React.FC = () => {
  return (
    <div className="quick-stats card">
      <h4>Quick Stats</h4>
      <ul>
        <li>Total leaves used: <strong>28</strong></li>
        <li>Total available: <strong>18</strong></li>
        <li>Pending Request/s: <strong>3</strong></li>
      </ul>
    </div>
  );
};

export default QuickStats;
