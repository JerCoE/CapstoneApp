import "./App.css";

import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useState } from "react";

import ActivityLog from "./Frontend/components/ActivityLog";
import AdminDashboard from "./Frontend/pages/Admin/AdminDashboard";
import AuthCallback from './Frontend/pages/AuthCallback';
import Calendar from "./Frontend/components/Calendar";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import LeaveRequests from "./Frontend/components/LeaveRequests";
import LeaveTracker from "./Frontend/pages/Admin/LeaveTracker";
import LoginScreen from "./Frontend/components/LoginScreen";
import Masterlist from "./Frontend/pages/Admin/Masterlist";
import { supabase } from './Frontend/lib/supabaseClient';

// Admin pages



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate();

  // New onLogin will receive (email, role)
  const handleLogin = (emailOrId?: string, roleFromLogin?: string) => {
    if (emailOrId) setUserEmail(emailOrId);

    const roleNormalized = roleFromLogin === 'admin' ? 'admin' : 'employee';
    setRole(roleNormalized);
    setIsLoggedIn(true);
    // navigate to the correct area
    navigate(roleNormalized === 'admin' ? '/admin' : '/dashboard');
  };

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setIsLoggedIn(false);
    setUserEmail("");
    setRole("");
    navigate('/');
  };

  const DashboardHome: React.FC = () => (
    <section className="cards-grid">
      <div className="card">
        <h3>Available Leaves</h3>
        <div className="card-content">
          <div className="leave-count">12</div>
          <div className="leave-label">days remaining</div>
        </div>
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
    </section>
  );

  return (
    <div className="size-full">
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
          {/* Visiting /admin (index) will show LeaveTracker */}
          <Route index element={<LeaveTracker />} />
          <Route path="masterlist" element={<Masterlist />} />
      
          <Route path="activity" element={<ActivityLog />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={<Navigate to={isLoggedIn ? (role === 'admin' ? '/admin' : '/dashboard') : '/'} />} />
      </Routes>
    </div>
  );
}