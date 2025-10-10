import React, { useState } from 'react';
import './EmployeeDashboard.css';

type NavKey = 'main' | 'leave' | 'calendar';

type EmployeeDashboardProps = {
	onLogout?: () => void;
};

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onLogout }) => {
	const [active, setActive] = useState<NavKey>('main');

	// sample data — replace with real data when available
	const availableLeaves = 12;
	const upcomingLeaves = [
		{ id: 1, name: 'Vacation', from: '2025-11-03', to: '2025-11-07' },
		{ id: 2, name: 'Medical', from: '2025-12-15', to: '2025-12-16' },
	];

	return (
		<div className="employee-dashboard">
			<aside className="side-nav" aria-label="Primary">
				<div className="logo">ERNI</div>
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
				</nav>

				<div className="side-footer">
					<button
						className="nav-btn logout"
						onClick={() => (onLogout ? onLogout() : console.log('logout'))}
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
					<section className="placeholder">
						<h2>Calendar</h2>
						<p>Calendar component will appear here.</p>
					</section>
				)}
			</main>
		</div>
	);
};

export default EmployeeDashboard;

