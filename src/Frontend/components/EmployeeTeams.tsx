import React from 'react';
import './styles/EmployeeTeams.css';

const EmployeeTeams: React.FC = () => {
  return (
    <div className="employee-teams card">
      <h4>Team/s</h4>
      <div className="teams-list">
        <div className="team-pill">DE/DA Starbucks</div>
        <div className="team-pill">DE/DA Starbucks</div>
      </div>
    </div>
  );
};

export default EmployeeTeams;
