import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook that protects admin routes by redirecting to login if user is not admin.
 * Should be used in admin route components.
 */
export function useRequireAdmin() {
	const { isAdmin, isAuthenticating, isRoleLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Only redirect if we've finished loading auth state AND role check
		if (!isAuthenticating && !isRoleLoading && !isAdmin) {
			navigate({ to: "/login" });
		}
	}, [isAdmin, isAuthenticating, isRoleLoading, navigate]);

	return { isAdmin, isAuthenticating: isAuthenticating || isRoleLoading };
}

