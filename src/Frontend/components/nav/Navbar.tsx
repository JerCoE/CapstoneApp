import './Navbar.css';

import ERNILogo from '/src/Frontend/assets/ERNI_logo_color.png';
import { NavLink } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useMsal } from '@azure/msal-react';

type NavbarProps = {
  onLogout?: () => void;
  // prefer passing a user display name, but accept email as a fallback for backwards-compat
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
};

function prettifyName(raw: string | undefined): string {
  if (!raw) return '';
  // if raw looks like an email, derive a friendly name from local part
  if (raw.includes('@')) {
    const local = raw.split('@')[0];
    // replace common separators with spaces
    const words = local.replace(/[._\-+]/g, ' ').split(/\s+/).filter(Boolean);
    // Capitalize each word
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  // If it's already a name, try to normalize spacing and capitalization
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default function Navbar({
  onLogout,
  userName,
  userEmail,
  isAdmin: isAdminProp,
}: NavbarProps) {
  const { accounts } = useMsal();
  const { user, loading, logout } = useAuth();

  // Compute raw name with priority:
  // 1) MSAL account name (accounts[0].name)
  // 2) user.display_name (from your auth/context)
  // 3) userName prop
  // 4) userEmail prop
  const rawName =
    accounts?.[0]?.name ??
    user?.display_name ??
    userName ??
    userEmail ??
    '';

  // Convert email -> pretty name if necessary
  const displayName = prettifyName(rawName);

  const display = displayName ? `Welcome, ${displayName}` : 'Welcome';

  // If parent passes isAdmin prop, trust it; otherwise derive from context user.roles
  const computedIsAdmin =
    typeof isAdminProp === 'boolean'
      ? isAdminProp
      : Array.isArray(user?.roles) && user!.roles!.includes('admin');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('Navbar: logout failed', err);
    }

    try {
      onLogout?.();
    } catch {}
  };

  // role label text based on user/roles (only show after roles load to avoid flicker)
  const roleLabel =
    !loading && (user || displayName) ? (computedIsAdmin ? 'Admin' : 'Employee') : undefined;

  return (
    <aside className="side-nav" aria-label="Primary">
      <div className="logo">
        <img src={ERNILogo} alt="ERNI" className="erni-logo" />
        <div className="welcome-text">{display}</div>

        {/* Role label shown below Welcome in the sidebar (only once user info is available) */}
        {roleLabel && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: '#fff',
              opacity: 0.95,
              background: 'rgba(0,0,0,0.08)',
              padding: '4px 8px',
              borderRadius: 6,
              display: 'inline-block',
            }}
            aria-hidden={false}
          >
            {roleLabel}
          </div>
        )}
      </div>

      <nav>
        <NavLink to="" end className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Main Dashboard
        </NavLink>

        {/* Show MASTERLIST for admins; Leave Request for non-admin users */}
        {computedIsAdmin ? (
          <NavLink to="masterlist" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
            Master List
          </NavLink>
        ) : (
          <NavLink to="leave" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
            Leave Request
          </NavLink>
        )}

        <NavLink to="calendar" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Calendar
        </NavLink>
        <NavLink to="activity" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
          Activity Log
        </NavLink>

        {/* Approvals kept for admins; Admin nav item removed */}
        {computedIsAdmin && (
          <NavLink to="/admin/approvals" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
            Approvals
          </NavLink>
        )}
      </nav>

      <div className="side-footer">
        <button className="nav-btn logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
