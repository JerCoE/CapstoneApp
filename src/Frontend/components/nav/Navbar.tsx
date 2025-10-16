import './Navbar.css';

import ERNILogo from '/src/Frontend/assets/ERNI_logo_color.png';
import { NavLink } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

type NavbarProps = {
  onLogout?: () => void;
  userEmail?: string;
  isAdmin?: boolean;
};

export default function Navbar({ onLogout, userEmail, isAdmin }: NavbarProps) {
  const { accounts } = useMsal();
  const displayName = accounts?.[0]?.name ?? userEmail ?? '';
  const display = displayName ? `Welcome, ${displayName}` : 'Welcome';

  return (
    <aside className="side-nav" aria-label="Primary">
      <div className="logo">
        <img src={ERNILogo} alt="ERNI" className="erni-logo" />
        <div className="welcome-text">{display}</div>
      </div>

      <nav>
        <NavLink to="" end className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Main Dashboard
        </NavLink>
        <NavLink to="leave" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Leave Request
        </NavLink>
        <NavLink to="calendar" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Calendar
        </NavLink>
        <NavLink to="activity" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Activity Log
        </NavLink>

        {/* Admin links (shown only when isAdmin is true) */}
        {isAdmin && (
          <>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
              Admin
            </NavLink>
            <NavLink to="/admin/approvals" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
              Approvals
            </NavLink>
          </>
        )}
      </nav>

      <div className="side-footer">
        <button className="nav-btn logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
