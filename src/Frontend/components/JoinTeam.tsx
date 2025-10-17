import React from 'react';
import './styles/JoinTeam.css';

const JoinTeam: React.FC = () => {
  return (
    <div className="join-team card">
      <h4>Join Team</h4>
      <div className="join-list">
        <div className="join-row"><div className="pill"><span className="name">DE/DA Starbucks</span><span className="actions"><button className="btn small">+</button></span></div></div>
        <div className="join-row"><div className="pill"><span className="name">DE/DA Lulalaoo</span><span className="actions"><button className="btn small">+</button></span></div></div>
        <div className="join-row"><div className="pill"><span className="name">DE/DA Get</span><span className="actions"><button className="btn small">+</button></span></div></div>
        <div className="join-row"><div className="pill"><span className="name">DE/DA Foodapp</span><span className="actions"><button className="btn small">+</button></span></div></div>
      </div>
    </div>
  );
};

export default JoinTeam;
