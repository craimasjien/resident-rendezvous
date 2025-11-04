import { initAnonymousAuth, getCurrentUser } from "../firebaseClient";

/**
 * Helper function to initialize anonymous auth and update state
 */
export async function initializeAnonymousAuth(
	setUserId: (uid: string) => void,
	setIsAnonymous: (isAnonymous: boolean) => void,
): Promise<void> {
	try {
		const { user } = await initAnonymousAuth();
		setUserId(user.uid);
		setIsAnonymous(user.isAnonymous);
	} catch (err) {
		console.error("Failed to initialize anonymous auth", err);
		throw err;
	}
}
