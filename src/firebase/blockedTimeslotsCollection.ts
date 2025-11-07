import { collection, getFirestore } from "firebase/firestore";

import { getFirebaseApp } from "@/firebaseClient";
import {
	getBlockedTimeslotsCollectionPath,
	type BlockedTimeslot,
	type BlockedTimeslotWriteData,
} from "@/types/blockedTimeslot";
import { createConverter } from "./converterFactory";

export const blockedTimeslotConverter = createConverter<BlockedTimeslot, BlockedTimeslotWriteData>();

export const getBlockedTimeslotsCollection = () => {
	const app = getFirebaseApp();
	const firestore = getFirestore(app);
	const collectionPath = getBlockedTimeslotsCollectionPath();

	return collection(firestore, collectionPath).withConverter(blockedTimeslotConverter);
};

