import { type FirebaseApp, initializeApp } from "firebase/app";
import {
	getAuth,
	onAuthStateChanged,
	signInAnonymously,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	type User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
	.filter(([, value]) => typeof value === "undefined" || value === "")
	.map(([key]) => key);

if (missingKeys.length > 0) {
	console.warn(
		`Firebase configuration is missing values for: ${missingKeys.join(", ")}. ` +
			"Double-check your environment variables.",
	);
}

let cachedApp: FirebaseApp | undefined;

export const getFirebaseApp = () => {
	if (!cachedApp) {
		cachedApp = initializeApp(firebaseConfig);
	}

	return cachedApp;
};

export const initAnonymousAuth = async () => {
	const app = getFirebaseApp();
	const auth = getAuth(app);

	try {
		const currentUser =
			auth.currentUser ?? (await signInAnonymously(auth)).user;

		return { auth, user: currentUser };
	} catch (error) {
		console.error("Failed to initialize anonymous auth", error);
		throw error;
	}
};

export const observeAuth = (callback: (userId: string | null) => void) => {
	const app = getFirebaseApp();
	const auth = getAuth(app);

	return onAuthStateChanged(auth, (user) => {
		callback(user?.uid ?? null);
	});
};

export const signInWithEmail = async (
	email: string,
	password: string,
): Promise<FirebaseUser> => {
	const app = getFirebaseApp();
	const auth = getAuth(app);

	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		return userCredential.user;
	} catch (error) {
		console.error("Failed to sign in with email", error);
		throw error;
	}
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
	const app = getFirebaseApp();
	const auth = getAuth(app);
	const provider = new GoogleAuthProvider();

	try {
		const userCredential = await signInWithPopup(auth, provider);
		return userCredential.user;
	} catch (error) {
		console.error("Failed to sign in with Google", error);
		throw error;
	}
};

export const signOut = async (): Promise<void> => {
	const app = getFirebaseApp();
	const auth = getAuth(app);

	try {
		await firebaseSignOut(auth);
	} catch (error) {
		console.error("Failed to sign out", error);
		throw error;
	}
};

export const getCurrentUser = (): FirebaseUser | null => {
	const app = getFirebaseApp();
	const auth = getAuth(app);
	return auth.currentUser;
};
