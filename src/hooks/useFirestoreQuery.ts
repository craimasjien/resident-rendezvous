import { useEffect, useState } from "react";
import type { Query } from "firebase/firestore";
import { onSnapshot as firestoreOnSnapshot } from "firebase/firestore";

interface UseFirestoreQueryOptions<T> {
	query: Query<T>;
	enabled?: boolean;
}

interface UseFirestoreQueryResult<T> {
	data: T[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Generic hook for subscribing to Firestore queries with real-time updates.
 * Handles loading states, errors, and cleanup automatically.
 */
export function useFirestoreQuery<T>(
	options: UseFirestoreQueryOptions<T>,
): UseFirestoreQueryResult<T> {
	const { query, enabled = true } = options;
	const [data, setData] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!enabled) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		const unsubscribe = firestoreOnSnapshot(
			query,
			(snapshot) => {
				const items: T[] = [];
				snapshot.forEach((doc) => {
					items.push(doc.data());
				});

				setData(items);
				setIsLoading(false);
				setError(null);
			},
			(err) => {
				console.error("Error listening to Firestore query", err);
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsLoading(false);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [query, enabled]);

	return { data, isLoading, error };
}
