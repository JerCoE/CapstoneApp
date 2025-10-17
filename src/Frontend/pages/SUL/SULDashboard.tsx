// src/Frontend/pages/SUL/SULDashboard.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import RoleChecker from "../../components/nav/RoleChecker"; // or the path you currently use

export default function SULDashboard(): JSX.Element {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* left: role-aware navbar forced to SUL mode */}
      <aside style={{ width: 250 }}>
        <RoleChecker mode="sul" />
      </aside>

      {/* main content area where child routes render */}
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}