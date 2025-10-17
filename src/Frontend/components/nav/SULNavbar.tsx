import './Navbar.css';

import ERNILogo from '/src/Frontend/assets/ERNI_logo_color.png';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useMsal } from '@azure/msal-react';

type Props = {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
};

function prettifyName(raw: string | undefined): string {
  if (!raw) return '';
  if (raw.includes('@')) {
    const local = raw.split('@')[0];
    const words = local.replace(/[._\-+]/g, ' ').split(/\s+/).filter(Boolean);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default function SULNavbar({ onLogout, userName, userEmail }: Props) {
  const { accounts } = useMsal();
  const { user, logout } = useAuth();

  const rawName = accounts?.[0]?.name ?? user?.display_name ?? userName ?? userEmail ?? '';
  const displayName = prettifyName(rawName);
  const display = displayName ? `Welcome, ${displayName}` : 'Welcome';

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.warn('SULNavbar.logout', err); }
    try { onLogout?.(); } catch {}
  };

  return (
    <aside className="side-nav" aria-label="SUL">
      <div className="logo">
        <img src={ERNILogo} alt="ERNI" className="erni-logo" />
        <div className="welcome-text">{display}</div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#fff', opacity: 0.95 }} aria-hidden>
          SUL
        </div>
      </div>

      <nav>
        <NavLink to="/sul" end className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          SUL Dashboard
        </NavLink>

        <NavLink to="/sul/approvals" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Approvals
        </NavLink>

        <NavLink to="/sul/leave" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Leave Requests
        </NavLink>

        <NavLink to="/sul/calendar" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Calendar
        </NavLink>

        <NavLink to="/sul/activity" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Activity Log
        </NavLink>
      </nav>

      <div className="side-footer">
        <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
