import './ActivityLog.css';
import React from 'react';

const ActivityLog: React.FC = () => {
	// placeholder activity items
	const items = [
		{ id: 1, text: 'Leave request Submitted (Sick Leave)', time: '2025-10-13 09:12' },
		{ id: 2, text: 'Leave request Submitted (Vacation)', time: '2025-09-27 14:52' },
		{ id: 3, text: 'Leave request Submitted (Sick Leave)', time: '2025-08-05 10:03' },
	];

	return (
		<div className="activity-root">
			<h2>Activity Log</h2>
			<div className="activity-list">
				{items.map(it => (
					<div key={it.id} className="activity-item">
						<div className="activity-text">{it.text}</div>
						<div className="activity-time">{it.time}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ActivityLog;


