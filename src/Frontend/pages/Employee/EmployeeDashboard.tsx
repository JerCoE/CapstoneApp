// React import not required with new JSX transformsS

import '../../components/nav/Navbar.css';

import RoleChecker from '../../components/nav/RoleChecker';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout({ onLogout, userEmail }: { onLogout?: () => void; userEmail?: string }) {
  return (
    <div className="employee-dashboard">
  <RoleChecker onLogout={onLogout} userEmail={userEmail} />
      
      <main className="dashboard-main">
        <Outlet />
        
   
      </main>
    </div>
  );
}

