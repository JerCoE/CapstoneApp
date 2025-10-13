import React, { useState } from 'react';
import './EmployeeDashboard.css';
import Calendar from './Calendar';
import ActivityLog from './ActivityLog';
import { useMsal } from '@azure/msal-react';

type NavKey = 'main' | 'leave' | 'calendar' | 'activity';

type EmployeeDashboardProps = {
	onLogout?: () => void;
};

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onLogout }) => {
	const [active, setActive] = useState<NavKey>('main');

	const { accounts } = useMsal();
	
	// sample data — replace with real data when available
	const availableLeaves = 12;
	const upcomingLeaves = [
		{ id: 1, name: 'Vacation', from: '2025-11-03', to: '2025-11-07' },
		{ id: 2, name: 'Sick', from: '2025-12-15', to: '2025-12-16' },
	];

	return (
		<div className="employee-dashboard">
			<aside className="side-nav" aria-label="Primary">
				<div className="logo">Welcome, {accounts?.[0]?.name ?? accounts?.[0]?.username}</div>

				<nav>
					<button
						className={active === 'main' ? 'nav-btn active' : 'nav-btn'}
						onClick={() => setActive('main')}
					>
						Main Dashboard
					</button>
					<button
						className={active === 'leave' ? 'nav-btn active' : 'nav-btn'}
						onClick={() => setActive('leave')}
					>
						Leave Request
					</button>
					<button
						className={active === 'calendar' ? 'nav-btn active' : 'nav-btn'}
						onClick={() => setActive('calendar')}
					>
						Calendar
					</button>
					<button
						className={active === 'activity' ? 'nav-btn active' : 'nav-btn'}
						onClick={() => setActive('activity')}
					>
						Activity Log
					</button>
				</nav>

				<div className="side-footer">
					<button
						className="nav-btn logout"
						onClick={async () => {
							if (onLogout) onLogout();
							
						}}
					>
						Logout
					</button>
				</div>
			</aside>

			<main className="dashboard-main">
				{active === 'main' && (
					<section className="cards-grid">
						<div className="card">
							<h3>Available Leaves</h3>
							<div className="card-content">
								<div className="leave-count">{availableLeaves}</div>
								<div className="leave-label">days remaining</div>
							</div>
						</div>

						<div className="card">
							<h3>Upcoming Leave/s</h3>
							<div className="card-content upcoming-list">
								{upcomingLeaves.length === 0 ? (
									<div className="empty">No upcoming leaves</div>
								) : (
									<ul>
										{upcomingLeaves.map((u) => (
											<li key={u.id}>
												<strong>{u.name}</strong>
												<div className="dates">{u.from} → {u.to}</div>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</section>
				)}

				{active === 'leave' && (
					<section className="placeholder">
						<h2>Leave Request</h2>
						<p>Leave request form will appear here.</p>
					</section>
				)}

				{active === 'calendar' && (
					<section className="calendar-section">
						<Calendar />
					</section>
				)}

				{active === 'activity' && (
					<section className="activity-section">
						<ActivityLog />
					</section>
				)}
			</main>
		</div>
	);
};

export default EmployeeDashboard;

