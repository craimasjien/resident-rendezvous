import type {
	FirestoreDataConverter,
	QueryDocumentSnapshot,
	SnapshotOptions,
	WithFieldValue,
} from "firebase/firestore";

/**
 * Creates a generic Firestore converter that handles the common pattern
 * of converting between Firestore documents and application types.
 * 
 * @template T - The application type (with id field)
 * @template TWrite - The write type (without id field)
 */
export function createConverter<T extends { id: string }, TWrite>(
): FirestoreDataConverter<T, TWrite> {
	return {
		toFirestore(data: T): WithFieldValue<TWrite> {
			const { id: _ignoreId, ...rest } = data as T;
			return rest as WithFieldValue<TWrite>;
		},
		fromFirestore(
			snapshot: QueryDocumentSnapshot<TWrite>,
			options?: SnapshotOptions,
		): T {
			const data = snapshot.data(options);
			return {
				id: snapshot.id,
				...data,
			} as T;
		},
	};
}
