import React, { useState } from "react";
import "./App.css";
import Calendar from "./Frontend/components/Calendar";
import LoginScreen from "./Frontend/components/LoginScreen";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication - accepts any email/password
    setUserEmail(email);
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
        <Calendar />
      )}
    </div>
  );
}