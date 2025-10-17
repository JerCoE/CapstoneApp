import "./App.css";

import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import ActivityLog from "./Frontend/components/ActivityLog";
import AdminDashboard from "./Frontend/pages/Admin/AdminDashboard";
import Approvals from "./Frontend/pages/Admin/Approvals";
import AuthCallback from './Frontend/pages/AuthCallback';
import CXDashboard from "./Frontend/pages/CX/CXDashboard";
import CXHomeScreen from "./Frontend/pages/CX/CXHomeScreen";
import CXTeams from "./Frontend/pages/CX/CXTeams";
import Calendar from "./Frontend/components/Calendar";
import DashboardHomeScreen from "./Frontend/pages/Employee/DashboardHomeScreen";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import LeaveRequests from "./Frontend/components/LeaveRequests";
import LeaveTracker from "./Frontend/pages/Admin/LeaveTracker";
import LoginScreen from "./Frontend/components/LoginScreen";
import Masterlist from "./Frontend/pages/Admin/Masterlist";
import SULDashboard from "./Frontend/pages/SUL/SULDashboard";
import SULHomeScreen from "./Frontend/pages/SUL/SULHomeScreen";
import { supabase } from './Frontend/lib/supabaseClient';
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate();

  // onLogin will receive (email, role?)
  const handleLogin = (emailOrId?: string, roleFromLogin?: string) => {
    if (emailOrId) setUserEmail(emailOrId);

    // Normalize incoming role safely and case-insensitively
    const roleNormalized = (() => {
      const r = (roleFromLogin ?? '').toString().toLowerCase();
      if (r === 'admin') return 'admin';
      if (r === 'sul') return 'sul';
      if (r === 'cx') return 'cx';
      return 'employee';
    })();

    setRole(roleNormalized);
    setIsLoggedIn(true);

    // navigate to the correct area
    if (roleNormalized === 'admin') navigate('/admin');
    else if (roleNormalized === 'sul') navigate('/sul');
    else if (roleNormalized === 'cx') navigate('/cx');   // <- new
    else navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase if available
      if (supabase && supabase.auth) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // ignore sign-out errors but log
      // console.warn('Sign-out failed', e);
    }

    setIsLoggedIn(false);
    setUserEmail("");
    setRole("");
    navigate('/');
  };
        
  return (
    <div className="size-full">
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={!isLoggedIn ? <LoginScreen onLogin={handleLogin} /> : <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />}
          />

          <Route
            path="/dashboard/*"
            element={isLoggedIn ? <DashboardLayout onLogout={handleLogout} userEmail={userEmail} /> : <Navigate to="/" />}
          >
            <Route index element={<DashboardHomeScreen />} />
            <Route path="leave" element={<LeaveRequests />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="activity" element={<ActivityLog />} />
          </Route>

          <Route
            path="/admin/*"
            element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/" />}
          >
            {/* nested admin routes render inside AdminDashboard via <Outlet /> */}
            <Route index element={<LeaveTracker />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="masterlist" element={<Masterlist />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>

          <Route
            path="/sul/*"
            element={isLoggedIn ? <SULDashboard /> : <Navigate to="/" />}
          >
            <Route index element={<SULHomeScreen />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="leave" element={<LeaveRequests />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="activity" element={<ActivityLog />} />
          </Route>

          <Route
            path="/cx/*"
            element={isLoggedIn ? <CXDashboard /> : <Navigate to="/" />}
          >
            <Route index element={<CXHomeScreen />} />
            <Route path="leave" element={<LeaveRequests />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="teams" element={<CXTeams />} />
            <Route path="activity" element={<ActivityLog />} />
          </Route>

          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="*" element={<Navigate to={isLoggedIn ? (role === 'admin' ? '/admin' : '/dashboard') : '/'} />} />
        </Routes>
      </div>
    </div>
  );
}