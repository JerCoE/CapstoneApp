import './Navbar.css';

import AdminNavbar from './AdminNavbar';
import CXNavbar from './CXNavbar';
import EmployeeNavbar from './EmployeeNavbar';
import SULNavbar from './SULNavbar';
import { useAuth } from '../../lib/AuthContext';

type NavbarProps = {
  onLogout?: () => void;
  // prefer passing a user display name, but accept email as a fallback for backwards-compat
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  // optional mode: when 'sul' or 'cx' the navbar shows the role-specific minimal link set
  mode?: 'default' | 'sul' | 'cx';
};

export default function RoleChecker({
  onLogout,
  userName,
  userEmail,
  mode = 'default',
}: NavbarProps) {
  const { user } = useAuth();

  // Derive role from user.roles if available
  const roles = Array.isArray(user?.roles) ? user!.roles!.map((r: any) => String(r).toLowerCase()) : [];
  const isAdminDerived = roles.includes('admin');
  const isSULDerived = roles.includes('sul') || roles.includes('pl');
  const isCXDerived = roles.includes('cx');

  // mode prop takes precedence; otherwise choose based on derived roles
  if (mode === 'sul' || ((!mode || mode === 'default') && isSULDerived)) {
    return <SULNavbar onLogout={onLogout} userName={userName} userEmail={userEmail} />;
  }

  if (mode === 'cx' || ((!mode || mode === 'default') && isCXDerived)) {
    return <CXNavbar onLogout={onLogout} userName={userName} userEmail={userEmail} />;
  }

  if (mode === 'default' && isAdminDerived) {
    return <AdminNavbar onLogout={onLogout} userName={userName} userEmail={userEmail} />;
  }

  return <EmployeeNavbar onLogout={onLogout} userName={userName} userEmail={userEmail} />;
}
