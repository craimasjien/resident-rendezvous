import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook that protects admin routes by redirecting to login if user is not admin.
 * Should be used in admin route components.
 */
export function useRequireAdmin() {
	const { isAdmin, isAuthenticating } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticating && !isAdmin) {
			navigate({ to: "/login" });
		}
	}, [isAdmin, isAuthenticating, navigate]);

	return { isAdmin, isAuthenticating };
}

