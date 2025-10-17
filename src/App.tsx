import React, { useState } from "react";
import "./App.css";
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from "./Frontend/components/LoginScreen";
import DashboardLayout from "./Frontend/pages/Employee/EmployeeDashboard";
import Calendar from "./Frontend/components/Calendar";
import ActivityLog from "./Frontend/components/ActivityLog";
import LeaveRequests from "./Frontend/components/LeaveRequests";
import LeavesRemaining from "./Frontend/components/LeavesRemaining";
import ButtonRequest from "./Frontend/components/ButtonRequest";
import QuickStats from "./Frontend/components/QuickStats";
import Teams from "./Frontend/components/Teams";
import JoinTeam from "./Frontend/components/JoinTeam";

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
    </div>
  );
}