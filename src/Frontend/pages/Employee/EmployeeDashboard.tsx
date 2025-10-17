// React import not required with new JSX transformsS

import '../../components/nav/Navbar.css';

import ButtonRequest from '../../components/ButtonRequest';
import JoinTeam from '../../components/JoinTeam';
import LeaveRequests from '../../components/LeaveRequests';
import LeavesRemaining from '../../components/LeavesRemaining';
import Navbar from '../../components/nav/Navbar';
import { Outlet } from 'react-router-dom';
import QuickStats from '../../components/QuickStats';
import Teams from '../../components/Teams';

export default function DashboardLayout({ onLogout, userEmail }: { onLogout?: () => void; userEmail?: string }) {
  return (
    <div className="employee-dashboard">
      <Navbar onLogout={onLogout} userEmail={userEmail} />
      
      <main className="dashboard-main">
        <Outlet />
        <QuickStats />
        <LeavesRemaining leaves={[]} />
        <LeaveRequests /> 
        <ButtonRequest />
        <Teams />
        <JoinTeam />
      </main>
    </div>
  );
}

