/**
 * Visits are stored using local calendar date and 24-hour time strings so the
 * UI can render familiar values for the family. When comparisons across time
 * zones are necessary, derive a UTC timestamp from these fields at the call
 * site using `VISIT_LOCAL_TIME_ZONE`.
 */
export interface Visit {
	id: string;
	date: string;
	time: string;
	visitorName: string;
	description?: string;
	durationMinutes: number;
	userId: string;
}

export type VisitWriteData = Omit<Visit, "id">;

const resolveAppId = (overrideAppId?: string) => {
	const appId = overrideAppId ?? import.meta.env.VITE_FIREBASE_APP_ID;

	if (!appId) {
		throw new Error(
			"VITE_FIREBASE_APP_ID is required to resolve the visits collection path.",
		);
	}

	return appId;
};

export const getVisitsCollectionPath = (appId?: string) =>
	`artifacts/${resolveAppId(appId)}/public/data/visits`;

export const VISIT_LOCAL_TIME_ZONE = "Europe/Amsterdam" as const;
