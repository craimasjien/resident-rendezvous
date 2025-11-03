import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import type { Visit } from "@/types/visit";

interface UseVisitsResult {
	visits: Visit[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Hook that subscribes to Firestore visits collection with real-time updates.
 * Maps documents to Visit objects using the converter and manages loading/error states.
 * Only sets up the listener after authentication is complete.
 */
export function useVisits(): UseVisitsResult {
	const userId = useCurrentUserId();
	const [visits, setVisits] = useState<Visit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// Don't set up the listener until authentication is complete
		if (userId === null) {
			// Authentication is still in progress
			setIsLoading(true);
			setError(null);
			return;
		}

		const collectionRef = getVisitsCollection();

		const unsubscribe = onSnapshot(
			collectionRef,
			(snapshot) => {
				const visitsList: Visit[] = [];
				snapshot.forEach((doc) => {
					visitsList.push(doc.data());
				});

				// Sort visits by date and time for consistent display
				visitsList.sort((a, b) => {
					const dateCompare = a.date.localeCompare(b.date);
					if (dateCompare !== 0) {
						return dateCompare;
					}
					return a.time.localeCompare(b.time);
				});

				setVisits(visitsList);
				setIsLoading(false);
				setError(null);
			},
			(err) => {
				console.error("Error listening to visits collection", err);
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsLoading(false);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [userId]);

	return { visits, isLoading, error };
}

