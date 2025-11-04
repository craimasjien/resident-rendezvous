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
		let hasInitializedAnonymous = false;

		// Helper function to handle auth state changes
		const handleAuthStateChange = (uid: string | null) => {
			setUserId(uid);
			if (uid) {
				const user = getCurrentUser();
				setIsAnonymous(user?.isAnonymous ?? true);
				// Reset flag if we get a real user (not anonymous)
				if (user && !user.isAnonymous) {
					hasInitializedAnonymous = false;
				}
			} else {
				setIsAnonymous(true);
				// Only initialize anonymous auth if we haven't already done so
				// This prevents overwriting a session that's being restored
				if (!hasInitializedAnonymous) {
					hasInitializedAnonymous = true;
					initializeAnonymousAuth(setUserId, setIsAnonymous).catch((err) => {
						console.error("Failed to initialize anonymous auth after sign out", err);
						hasInitializedAnonymous = false;
					});
				}
			}
		};

		// Set up auth state observer first - Firebase's onAuthStateChanged fires
		// synchronously with the current auth state (including restored sessions)
		// This ensures we don't initialize anonymous auth before Firebase restores a session
		unsubscribe = observeAuth((uid) => {
			if (uid) {
				// User exists (could be anonymous or authenticated)
				handleAuthStateChange(uid);
			} else {
				// No user exists - initialize anonymous auth
				handleAuthStateChange(null);
			}
		});

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
