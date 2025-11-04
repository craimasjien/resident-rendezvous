import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
	component: LoginRoute,
});

function LoginRoute() {
	const { isAdmin, isAuthenticating, isRoleLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Only redirect if we've finished loading auth state AND role check, and user is admin
		if (!isAuthenticating && !isRoleLoading && isAdmin) {
			navigate({ to: "/dashboard" });
		}
	}, [isAdmin, isAuthenticating, isRoleLoading, navigate]);

	if (isAuthenticating || isRoleLoading) {
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

