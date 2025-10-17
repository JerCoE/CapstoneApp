// JSX automatic runtime - no need to import React directly
import './DashboardHomeScreen.css';
import '../../components/styles/AvailableLeaves.css';
import AvailableLeaves from '../../components/AvailableLeaves';
import UpcomingLeaves from '../../components/UpcomingLeaves';
import QuickStats from '../../components/QuickStats';
import EmployeeTeams from '../../components/EmployeeTeams';
import JoinTeam from '../../components/JoinTeam';
import ButtonRequest from '../../components/ButtonRequest';

export default function DashboardHome() {
	return (
			<div className="dashboard-home page-grid">
				<main className="center-column">
					<div className="content-inner">
						<div className="main-left">
							<AvailableLeaves />
							<UpcomingLeaves />
						</div>

						<div className="inline-right">
							<ButtonRequest />
							<QuickStats />
							<EmployeeTeams />
							<JoinTeam />
						</div>
					</div>
				</main>
			</div>
	);
}
