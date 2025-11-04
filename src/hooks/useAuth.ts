import { useEffect, useState } from "react";
import { observeAuth, signOut, getCurrentUser } from "../firebaseClient";
import { useUserRole } from "./useUserRole";
import { initializeAnonymousAuth } from "../utils/authUtils";

/**
 * Hook for managing authentication state.
 * Supports both anonymous authentication (for normal users) and email/password (for admins).
 */
export function useAuth() {
	const [userId, setUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isAnonymous, setIsAnonymous] = useState<boolean>(true);

	const { role, isLoading: isRoleLoading } = useUserRole(userId);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		// Helper function to handle auth state changes
		const handleAuthStateChange = (uid: string | null) => {
			setUserId(uid);
			if (uid) {
				const user = getCurrentUser();
				setIsAnonymous(user?.isAnonymous ?? true);
			} else {
				setIsAnonymous(true);
				// If signed out, initialize anonymous auth
				initializeAnonymousAuth(setUserId, setIsAnonymous).catch((err) => {
					console.error("Failed to initialize anonymous auth after sign out", err);
				});
			}
		};

		// Check if user is already authenticated
		const currentUser = getCurrentUser();
		if (currentUser) {
			setUserId(currentUser.uid);
			setIsAnonymous(currentUser.isAnonymous);
			// Set up auth state observer
			unsubscribe = observeAuth(handleAuthStateChange);
		} else {
			// Initialize anonymous auth if no user is authenticated
			initializeAnonymousAuth(setUserId, setIsAnonymous)
				.then(() => {
					unsubscribe = observeAuth(handleAuthStateChange);
				})
				.catch((error: unknown) => {
					const message =
						error instanceof Error
							? error.message
							: "Unexpected authentication error";
					setError(message);
				});
		}

		return () => {
			unsubscribe?.();
		};
	}, []);

	const handleSignOut = async () => {
		try {
			await signOut();
			// After sign out, re-initialize anonymous auth
			await initializeAnonymousAuth(setUserId, setIsAnonymous);
		} catch (err) {
			console.error("Failed to sign out", err);
		}
	};

	return {
		userId,
		error,
		isAuthenticating: userId === null && error === null,
		isAdmin: role === "administrator",
		isRoleLoading,
		isAnonymous,
		signOut: handleSignOut,
		role,
	};
}
