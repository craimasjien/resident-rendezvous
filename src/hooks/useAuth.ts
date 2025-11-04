import { useEffect, useState } from "react";
import { initAnonymousAuth, observeAuth } from "../firebaseClient";

/**
 * Hook for managing authentication state
 */
export function useAuth() {
	const [userId, setUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		initAnonymousAuth()
			.then(({ user }) => {
				setUserId(user.uid);
				unsubscribe = observeAuth(setUserId);
			})
			.catch((error: unknown) => {
				const message =
					error instanceof Error
						? error.message
						: "Unexpected authentication error";
				setError(message);
			});

		return () => {
			unsubscribe?.();
		};
	}, []);

	return {
		userId,
		error,
		isAuthenticating: userId === null && error === null,
	};
}
