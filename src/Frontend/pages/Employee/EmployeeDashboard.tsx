// React import not required with new JSX transforms
import { Outlet } from 'react-router-dom';
import '../../components/nav/Navbar.css';
import Navbar from '../../components/nav/Navbar';
import QuickStats from '../../components/QuickStats';
import LeavesRemaining from '../../components/LeavesRemaining';
import LeaveRequests from '../../components/LeaveRequests';
import ButtonRequest from '../../components/ButtonRequest';
import Teams from '../../components/Teams';
import JoinTeam from '../../components/JoinTeam';

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

