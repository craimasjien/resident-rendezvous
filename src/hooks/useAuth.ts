import { useEffect, useState } from "react";
import { initAnonymousAuth, observeAuth, signOut, getCurrentUser } from "../firebaseClient";
import { useUserRole } from "./useUserRole";

/**
 * Hook for managing authentication state.
 * Supports both anonymous authentication (for normal users) and email/password (for admins).
 */
export function useAuth() {
	const [userId, setUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isAnonymous, setIsAnonymous] = useState<boolean>(true);

	const { role } = useUserRole(userId);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		// Check if user is already authenticated
		const currentUser = getCurrentUser();
		if (currentUser) {
			setUserId(currentUser.uid);
			setIsAnonymous(currentUser.isAnonymous);
			// Set up auth state observer
			unsubscribe = observeAuth((uid) => {
				setUserId(uid);
				if (uid) {
					const user = getCurrentUser();
					setIsAnonymous(user?.isAnonymous ?? true);
				} else {
					setIsAnonymous(true);
					// If signed out, initialize anonymous auth
					initAnonymousAuth()
						.then(({ user }) => {
							setUserId(user.uid);
							setIsAnonymous(user.isAnonymous);
						})
						.catch((err) => {
							console.error("Failed to initialize anonymous auth after sign out", err);
						});
				}
			});
		} else {
			// Initialize anonymous auth if no user is authenticated
			initAnonymousAuth()
				.then(({ user }) => {
					setUserId(user.uid);
					setIsAnonymous(user.isAnonymous);
					unsubscribe = observeAuth((uid) => {
						setUserId(uid);
						if (uid) {
							const user = getCurrentUser();
							setIsAnonymous(user?.isAnonymous ?? true);
						} else {
							setIsAnonymous(true);
							// If signed out, initialize anonymous auth
							initAnonymousAuth()
								.then(({ user }) => {
									setUserId(user.uid);
									setIsAnonymous(user.isAnonymous);
								})
								.catch((err) => {
									console.error("Failed to initialize anonymous auth after sign out", err);
								});
						}
					});
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
			const { user } = await initAnonymousAuth();
			setUserId(user.uid);
			setIsAnonymous(user.isAnonymous);
		} catch (err) {
			console.error("Failed to sign out", err);
		}
	};

	return {
		userId,
		error,
		isAuthenticating: userId === null && error === null,
		isAdmin: role === "administrator",
		isAnonymous,
		signOut: handleSignOut,
	};
}
