import { collection, getFirestore } from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import type { User, UserWriteData } from "@/types/user";
import { createConverter } from "./converterFactory";

export const userConverter = createConverter<User, UserWriteData>();

export const getUsersCollection = () => {
	const app = getFirebaseApp();
	const firestore = getFirestore(app);

	return collection(firestore, "users").withConverter(userConverter);
};

