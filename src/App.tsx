import "./App.css";

import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useState } from "react";

import ActivityLog from "./Frontend/components/ActivityLog";
import AdminDashboard from "./Frontend/pages/Admin/AdminDashboard";
import AuthCallback from './Frontend/pages/AuthCallback';
import Calendar from "./Frontend/components/Calendar";
import DashboardHomeScreen from "./Frontend/pages/Employee/DashboardHomeScreen";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import LeaveRequests from "./Frontend/components/LeaveRequests";
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