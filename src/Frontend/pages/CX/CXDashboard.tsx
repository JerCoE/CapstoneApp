// src/Frontend/pages/CX/CXDashboard.tsx

import { Outlet } from "react-router-dom";
import React from "react";
import RoleChecker from "../../components/nav/RoleChecker";

export default function CXDashboard(): JSX.Element {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* left: role-aware navbar forced to CX mode */}
      <aside style={{ width: 250 }}>
        <RoleChecker mode="cx" />
      </aside>

      {/* main content area where child routes render */}
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}