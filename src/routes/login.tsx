import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
	component: LoginRoute,
});

function LoginRoute() {
	const { isAdmin, isAuthenticating } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Redirect to dashboard if already logged in as admin
		if (!isAuthenticating && isAdmin) {
			navigate({ to: "/dashboard" });
		}
	}, [isAdmin, isAuthenticating, navigate]);

	if (isAuthenticating) {
		return (
			<div className="text-center" style={{ padding: "3rem" }}>
				<p className="text-muted">Laden...</p>
			</div>
		);
	}

	return (
		<div>
			<LoginForm />
		</div>
	);
}

