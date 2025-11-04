import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { getVisitsCollection } from "@/firebase/visitsCollection";

/**
 * Hook for managing visit CRUD operations
 */
export function useVisitActions() {
	const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

	const deleteVisit = async (visitId: string) => {
		setDeletingVisitId(visitId);
		try {
			const collectionRef = getVisitsCollection();
			const visitDocRef = doc(collectionRef, visitId);
			await deleteDoc(visitDocRef);
			// Firestore listener will automatically update the UI
		} catch (error) {
			console.error("Error deleting visit", error);
			throw error;
		} finally {
			setDeletingVisitId(null);
		}
	};

	return {
		deleteVisit,
		deletingVisitId,
	};
}
