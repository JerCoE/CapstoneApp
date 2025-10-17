import OnLeaveList from './components/OnLeaveList';
import React from 'react';
import UpcomingLeavesList from './components/UpcomingLeavesList';
import LeaveTypeInsights from './components/LeaveTypeInsights';
import LeaveRequestCount from './components/LeaveRequestCount';

export default function LeaveTracker(): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <main style={{ flex: 1, padding: 24 }}>
        <OnLeaveList />
        <UpcomingLeavesList />
      </main>

      <aside style={{ width: 260, padding: 24 }}>
        <LeaveRequestCount />
        <div style={{ height: 12 }} />
        <LeaveTypeInsights />
      </aside>
    </div>
  );
}