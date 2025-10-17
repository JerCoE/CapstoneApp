import "./App.css";

import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import ActivityLog from "./Frontend/components/ActivityLog";
import AdminDashboard from "./Frontend/pages/Admin/AdminDashboard";
import AuthCallback from './Frontend/pages/AuthCallback';
import Calendar from "./Frontend/components/Calendar";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import LeaveRequests from "./Frontend/components/LeaveRequests";

import LeavesRemaining from "./Frontend/components/LeavesRemaining";
import ButtonRequest from "./Frontend/components/ButtonRequest";
import QuickStats from "./Frontend/components/QuickStats";
import Teams from "./Frontend/components/Teams";
import JoinTeam from "./Frontend/components/JoinTeam";

import LeaveTracker from "./Frontend/pages/Admin/LeaveTracker";
import LoginScreen from "./Frontend/components/LoginScreen";
import Masterlist from "./Frontend/pages/Admin/Masterlist";
import { supabase } from './Frontend/lib/supabaseClient';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate();

  // onLogin will receive (email, role?)
  const handleLogin = (emailOrId?: string, roleFromLogin?: string) => {
    if (emailOrId) setUserEmail(emailOrId);

    const roleNormalized = roleFromLogin === 'admin' ? 'admin' : 'employee';
    setRole(roleNormalized);
    setIsLoggedIn(true);
    // navigate to the correct area
    navigate(roleNormalized === 'admin' ? '/admin' : '/dashboard');
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

  const sampleLeaves = [
    { id: 'holiday', label: 'Holiday Leave', used: 7, total: 15, color: '#9b59b6' },
    { id: 'birthday', label: 'Birthday Leave', used: 0, total: 1, color: '#f39c12' },
    { id: 'sick', label: 'Sick Leave', used: 3, total: 15, color: '#e74c3c' },
    { id: 'vacation', label: 'Vacation Leave', used: 9, total: 15, color: '#2ecc71' },
    { id: 'parental', label: 'Parental Leave', used: 9, total: 130, color: '#3498db' },
  ];

  const DashboardHome: React.FC = () => (
    <div className="dashboard-home">
      <div className="main-middle">
        <div className="mainboard">
          <div className="mainboard-left">
            <div className="mainboard-panel">
              <div className="large-card">
                <LeavesRemaining className="leaves-remaining-wrapper" leaves={sampleLeaves} />
              </div>

              <div className="card">
                <h3>Upcoming Leave/s</h3>
                <div className="card-content upcoming-list">
                  <ul>
                    <li>
                      <strong>Vacation</strong>
                      <div className="dates">2025-11-03 → 2025-11-07</div>
                    </li>
                    <li>
                      <strong>Sick</strong>
                      <div className="dates">2025-12-15 → 2025-12-16</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <aside className="mainboard-right">
            <div className="card">
              <ButtonRequest />
            </div>

            <QuickStats />
            <Teams />
            <JoinTeam />
          </aside>
        </div>
      </div>
    </div>
  );

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
            <Route index element={<DashboardHome />} />
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
            <Route path="masterlist" element={<Masterlist />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>

          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="*" element={<Navigate to={isLoggedIn ? (role === 'admin' ? '/admin' : '/dashboard') : '/'} />} />
        </Routes>
      </div>
    </div>
  );
}