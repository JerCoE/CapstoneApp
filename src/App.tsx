import React, { useState } from "react";
import "./App.css";
import Calendar from "./Frontend/components/Calendar";
import LoginScreen from "./Frontend/components/LoginScreen";
import EmployeeDashboard from "./Frontend/components/EmployeeDashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (emailOrId: string | undefined, _password?: string) => {
    // Called after successful external auth; emailOrId may be email or id
    if (emailOrId) setUserEmail(emailOrId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
  };

  return (
    <div className="size-full">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <EmployeeDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}