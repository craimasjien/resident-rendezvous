import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import type { UserRole } from "@/types/user";

/**
 * Hook that fetches the user role from Firestore users collection.
 * Returns null if user document doesn't exist (defaults to 'user' role).
 */
export function useUserRole(userId: string | null): {
	role: UserRole | null;
	isLoading: boolean;
} {
	const [role, setRole] = useState<UserRole | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (userId === null) {
			setRole(null);
			setIsLoading(false);
			return;
		}

		const app = getFirebaseApp();
		const firestore = getFirestore(app);
		const userDocRef = doc(firestore, "users", userId);

		getDoc(userDocRef)
			.then((docSnapshot) => {
				if (docSnapshot.exists()) {
					const userData = docSnapshot.data();
					setRole(userData.role ?? "user");
				} else {
					// User document doesn't exist, default to 'user' role
					setRole("user");
				}
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching user role", error);
				setRole("user"); // Default to 'user' on error
				setIsLoading(false);
			});
	}, [userId]);

	return { role, isLoading };
}

