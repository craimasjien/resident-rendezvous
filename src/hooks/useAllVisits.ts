import { useEffect, useState } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import type { Visit } from "@/types/visit";

interface UseAllVisitsResult {
	visits: Visit[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Hook that fetches ALL visits from Firestore (admin only).
 * Used for dashboard statistics and admin views.
 */
export function useAllVisits(): UseAllVisitsResult {
	const [visits, setVisits] = useState<Visit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const collectionRef = getVisitsCollection();

		// Fetch all visits ordered by date and time
		const visitsQuery = query(
			collectionRef,
			orderBy("date"),
			orderBy("time"),
		);

		const unsubscribe = onSnapshot(
			visitsQuery,
			(snapshot) => {
				const visitsList: Visit[] = [];
				snapshot.forEach((doc) => {
					visitsList.push(doc.data());
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
	}, []);

	return { visits, isLoading, error };
}

