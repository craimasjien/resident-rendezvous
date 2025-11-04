import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/dashboard/Dashboard";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export const Route = createFileRoute("/dashboard")({
	component: DashboardRoute,
});

function DashboardRoute() {
	const { isAuthenticating } = useRequireAdmin();

	// Show loading state while authenticating or if admin status is not yet confirmed
	// Only show dashboard if we're done loading AND user is confirmed admin
	if (isAuthenticating) {
		return (
			<div className="text-center" style={{ padding: "3rem" }}>
				<p className="text-muted">Laden...</p>
			</div>
		);
	}

	// If not loading and not admin, useRequireAdmin will redirect to login
	// So we can safely render dashboard here
	return <Dashboard />;
}

