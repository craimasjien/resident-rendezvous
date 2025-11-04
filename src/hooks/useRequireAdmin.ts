import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook that protects admin routes by redirecting to login if user is not admin.
 * Should be used in admin route components.
 */
export function useRequireAdmin() {
	const { isAdmin, isAuthenticating, isRoleLoading, userId, role } = useAuth();
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
		// 1. We've finished loading auth state AND role check
		// 2. Role is loaded (not null) and user is NOT admin
		// 3. We're not already on the login page
		if (
			!isAuthenticating &&
			!isRoleLoading &&
			role !== null &&
			role !== "administrator" &&
			location.pathname !== "/login"
		) {
			// Use a small timeout to debounce and prevent rapid redirects
			redirectTimeoutRef.current = window.setTimeout(() => {
				navigate({ to: "/login", replace: true });
			}, 100);
		}

		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, [role, isAdmin, isAuthenticating, isRoleLoading, navigate, location.pathname, userId]);

	return { isAdmin, isAuthenticating: isAuthenticating || isRoleLoading };
}

