// React import not required with new JSX transformsS

import '../../components/nav/Navbar.css';

import ButtonRequest from '../../components/ButtonRequest';
import LeaveRequests from '../../components/LeaveRequests';
import Navbar from '../../components/nav/Navbar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout({ onLogout, userEmail }: { onLogout?: () => void; userEmail?: string }) {
  return (
    <div className="employee-dashboard">
      <Navbar onLogout={onLogout} userEmail={userEmail} />
      
      <main className="dashboard-main">
        <Outlet />
        
   
      </main>
    </div>
  );
}

