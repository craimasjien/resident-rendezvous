import { useEffect, useState } from "react";
import { onSnapshot, query, where } from "firebase/firestore";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import type { Visit } from "@/types/visit";
import { sortVisitsByDateAndTime } from "@/utils/visitUtils";

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
		
		// Filter to only fetch visits from today onwards to optimize network traffic
		// Date is stored as "yyyy-MM-dd" string, so we can compare directly
		const today = new Date().toISOString().slice(0, 10);
		const visitsQuery = query(
			collectionRef,
			where("date", ">=", today)
		);

		const unsubscribe = onSnapshot(
			visitsQuery,
			(snapshot) => {
				const visitsList: Visit[] = [];
				snapshot.forEach((doc) => {
					visitsList.push(doc.data());
				});

				// Sort visits by date and time for consistent display
				const sortedVisits = sortVisitsByDateAndTime(visitsList);

				setVisits(sortedVisits);
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

