// React import not required with new JSX transforms
import { Outlet } from 'react-router-dom';
import '../../components/nav/Navbar.css';
import Navbar from '../../components/nav/Navbar';

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

