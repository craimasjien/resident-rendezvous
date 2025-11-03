import {
	collection,
	type FirestoreDataConverter,
	getFirestore,
	type QueryDocumentSnapshot,
	type SnapshotOptions,
	type WithFieldValue,
} from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import {
	getVisitsCollectionPath,
	type Visit,
	type VisitWriteData,
} from "@/types/visit";

export const visitConverter: FirestoreDataConverter<Visit, VisitWriteData> = {
	toFirestore(visit) {
		const { id: _ignoreId, ...rest } = visit as Visit;

		return rest as WithFieldValue<VisitWriteData>;
	},
	fromFirestore(
		snapshot: QueryDocumentSnapshot<VisitWriteData>,
		options?: SnapshotOptions,
	) {
		const data = snapshot.data(options);

		return {
			id: snapshot.id,
			...data,
		};
	},
};

export const getVisitsCollection = () => {
	const app = getFirebaseApp();
	const firestore = getFirestore(app);
	const collectionPath = getVisitsCollectionPath();

	return collection(firestore, collectionPath).withConverter(visitConverter);
};
