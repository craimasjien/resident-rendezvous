import { collection, getFirestore } from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import {
	getVisitsCollectionPath,
	type Visit,
	type VisitWriteData,
} from "@/types/visit";
import { createConverter } from "./converterFactory";

export const visitConverter = createConverter<Visit, VisitWriteData>();

export const getVisitsCollection = () => {
	const app = getFirebaseApp();
	const firestore = getFirestore(app);
	const collectionPath = getVisitsCollectionPath();

	return collection(firestore, collectionPath).withConverter(visitConverter);
};
