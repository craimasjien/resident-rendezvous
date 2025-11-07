import { useEffect, useState } from "react";
import { onSnapshot, query, where } from "firebase/firestore";

import { getBlockedTimeslotsCollection } from "@/firebase/blockedTimeslotsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import type { BlockedTimeslot } from "@/types/blockedTimeslot";

interface UseBlockedTimeslotsResult {
	blockedTimeslots: BlockedTimeslot[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Hook that subscribes to Firestore blocked-timeslots collection with real-time updates.
 * Maps documents to BlockedTimeslot objects using the converter and manages loading/error states.
 * Only sets up the listener after authentication is complete.
 */
export function useBlockedTimeslots(): UseBlockedTimeslotsResult {
	const userId = useCurrentUserId();
	const [blockedTimeslots, setBlockedTimeslots] = useState<BlockedTimeslot[]>([]);
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

		const collectionRef = getBlockedTimeslotsCollection();
		
		// Filter to only fetch blocked timeslots from today onwards to optimize network traffic
		// Date is stored as "yyyy-MM-dd" string, so we can compare directly
		const today = new Date().toISOString().slice(0, 10);
		const blockedQuery = query(
			collectionRef,
			where("date", ">=", today)
		);

		const unsubscribe = onSnapshot(
			blockedQuery,
			(snapshot) => {
				const blockedList: BlockedTimeslot[] = [];
				snapshot.forEach((doc) => {
					blockedList.push(doc.data());
				});

				setBlockedTimeslots(blockedList);
				setIsLoading(false);
				setError(null);
			},
			(err) => {
				console.error("Error listening to blocked-timeslots collection", err);
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsLoading(false);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [userId]);

	return { blockedTimeslots, isLoading, error };
}

