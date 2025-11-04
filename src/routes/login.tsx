import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
	component: LoginRoute,
});

function LoginRoute() {
	const { isAuthenticating, isRoleLoading, userId, role } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const redirectTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		// Clear any pending redirect
		if (redirectTimeoutRef.current) {
			clearTimeout(redirectTimeoutRef.current);
			redirectTimeoutRef.current = null;
		}

		// Only redirect if:
		// 1. We have a userId (user is authenticated)
		// 2. We've finished loading auth state AND role check
		// 3. Role is loaded (not null) and user is admin
		// 4. We're still on the login page
		if (
			userId &&
			!isAuthenticating &&
			!isRoleLoading &&
			role !== null &&
			role === "administrator" &&
			location.pathname === "/login"
		) {
			// Use a small timeout to debounce and prevent rapid redirects
			redirectTimeoutRef.current = window.setTimeout(() => {
				navigate({ to: "/dashboard", replace: true });
			}, 100);
		}

		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, [userId, role, isAuthenticating, isRoleLoading, navigate, location.pathname]);

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

