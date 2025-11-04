import {
	collection,
	type FirestoreDataConverter,
	getFirestore,
	type QueryDocumentSnapshot,
	type SnapshotOptions,
	type WithFieldValue,
} from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import type { User, UserWriteData } from "@/types/user";

export const userConverter: FirestoreDataConverter<User, UserWriteData> = {
	toFirestore(user) {
		const { id: _ignoreId, ...rest } = user as User;

		return rest as WithFieldValue<UserWriteData>;
	},
	fromFirestore(
		snapshot: QueryDocumentSnapshot<UserWriteData>,
		options?: SnapshotOptions,
	) {
		const data = snapshot.data(options);

		return {
			id: snapshot.id,
			...data,
		};
	},
};

export const getUsersCollection = () => {
	const app = getFirebaseApp();
	const firestore = getFirestore(app);

	return collection(firestore, "users").withConverter(userConverter);
};

