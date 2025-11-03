import { useEffect, useState } from "react";

import { observeAuth } from "@/firebaseClient";

/**
 * Hook that returns the current authenticated user ID.
 * Returns null if user is not authenticated.
 */
export function useCurrentUserId(): string | null {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = observeAuth((uid) => {
			setUserId(uid);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	return userId;
}

