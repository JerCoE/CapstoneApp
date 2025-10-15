import React, { useState } from "react";
import "./App.css";
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from "./Frontend/components/LoginScreen";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import Calendar from "./Frontend/components/Calendar";
import ActivityLog from "./Frontend/components/ActivityLog";
import LeaveRequests from "./Frontend/components/LeaveRequests";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (emailOrId?: string) => {
    if (emailOrId) setUserEmail(emailOrId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
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
          element={!isLoggedIn ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
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

        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />} />
      </Routes>
    </div>
  );
}