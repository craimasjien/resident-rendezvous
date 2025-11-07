import { useMemo } from "react";
import { Calendar, Clock, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAllVisits } from "@/hooks/useAllVisits";

export default function Dashboard() {
	const { signOut } = useAuth();
	const { visits, isLoading, error } = useAllVisits();

	const today = new Date().toISOString().slice(0, 10);
	const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);
	const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	const stats = useMemo(() => {
		const totalVisits = visits.length;
		const upcomingVisits = visits.filter((v) => v.date >= today).length;
		const thisWeekVisits = visits.filter(
			(v) => v.date >= today && v.date <= nextWeek,
		).length;
		const thisMonthVisits = visits.filter(
			(v) => v.date >= today && v.date <= nextMonth,
		).length;
		const pastVisits = totalVisits - upcomingVisits;

		return {
			totalVisits,
			upcomingVisits,
			thisWeekVisits,
			thisMonthVisits,
			pastVisits,
		};
	}, [visits, today, nextWeek, nextMonth]);

	return (
		<div className="dashboard">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h2 className="h4 mb-0">Beheerder Dashboard</h2>
				<button
					type="button"
					className="btn btn-outline-secondary"
					onClick={signOut}
				>
					Uitloggen
				</button>
			</div>

			{error && (
				<div className="alert alert-danger mb-4" role="alert">
					<strong>Fout bij het laden:</strong> {error.message}
				</div>
			)}

			{isLoading && (
				<div className="text-center" style={{ padding: "3rem" }}>
					<p className="text-muted">Statistieken laden...</p>
				</div>
			)}

			{!isLoading && !error && (
				<>
					<section className="mb-5">
						<h3 className="h5 mb-4">Bezoek Statistieken</h3>
						<div className="row g-4">
							<div className="col-md-6 col-lg-3">
								<div
									style={{
										background: "white",
										borderRadius: "var(--radius-lg)",
										boxShadow: "var(--shadow-sm)",
										border: "1px solid var(--gray-200)",
										padding: "1.5rem",
									}}
								>
									<div className="d-flex align-items-center mb-2">
										<Calendar
											size={24}
											style={{ marginRight: "0.75rem", color: "var(--primary)" }}
										/>
										<span className="text-muted small">Totaal bezoeken</span>
									</div>
									<div className="h3 mb-0">{stats.totalVisits}</div>
								</div>
							</div>

							<div className="col-md-6 col-lg-3">
								<div
									style={{
										background: "white",
										borderRadius: "var(--radius-lg)",
										boxShadow: "var(--shadow-sm)",
										border: "1px solid var(--gray-200)",
										padding: "1.5rem",
									}}
								>
									<div className="d-flex align-items-center mb-2">
										<Clock
											size={24}
											style={{ marginRight: "0.75rem", color: "var(--success)" }}
										/>
										<span className="text-muted small">Komende bezoeken</span>
									</div>
									<div className="h3 mb-0">{stats.upcomingVisits}</div>
								</div>
							</div>

							<div className="col-md-6 col-lg-3">
								<div
									style={{
										background: "white",
										borderRadius: "var(--radius-lg)",
										boxShadow: "var(--shadow-sm)",
										border: "1px solid var(--gray-200)",
										padding: "1.5rem",
									}}
								>
									<div className="d-flex align-items-center mb-2">
										<Users
											size={24}
											style={{ marginRight: "0.75rem", color: "var(--info)" }}
										/>
										<span className="text-muted small">Deze week</span>
									</div>
									<div className="h3 mb-0">{stats.thisWeekVisits}</div>
								</div>
							</div>

							<div className="col-md-6 col-lg-3">
								<div
									style={{
										background: "white",
										borderRadius: "var(--radius-lg)",
										boxShadow: "var(--shadow-sm)",
										border: "1px solid var(--gray-200)",
										padding: "1.5rem",
									}}
								>
									<div className="d-flex align-items-center mb-2">
										<Calendar
											size={24}
											style={{ marginRight: "0.75rem", color: "var(--warning)" }}
										/>
										<span className="text-muted small">Deze maand</span>
									</div>
									<div className="h3 mb-0">{stats.thisMonthVisits}</div>
								</div>
							</div>
						</div>
					</section>

					<section>
						<h3 className="h5 mb-4">Systeem Instellingen</h3>
						<div
							style={{
								background: "white",
								borderRadius: "var(--radius-lg)",
								boxShadow: "var(--shadow-sm)",
								border: "1px solid var(--gray-200)",
								padding: "2rem",
							}}
						>
							<div className="d-flex align-items-center mb-3">
								<Settings
									size={24}
									style={{ marginRight: "0.75rem", color: "var(--gray-600)" }}
								/>
								<span className="text-muted">
									Systeem instellingen komen binnenkort beschikbaar.
								</span>
							</div>
						</div>
					</section>
				</>
			)}
		</div>
	);
}

