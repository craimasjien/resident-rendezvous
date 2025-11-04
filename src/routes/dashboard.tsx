import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/dashboard/Dashboard";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export const Route = createFileRoute("/dashboard")({
	component: DashboardRoute,
});

function DashboardRoute() {
	const { isAdmin, isAuthenticating } = useRequireAdmin();

	if (isAuthenticating || !isAdmin) {
		return (
			<div className="text-center" style={{ padding: "3rem" }}>
				<p className="text-muted">Laden...</p>
			</div>
		);
	}

	return <Dashboard />;
}

