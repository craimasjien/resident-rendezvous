/**
 * Business rules and validation logic for visits
 */

import type { Visit } from "@/types/visit";
import { parseTime } from "./timeUtils";

/**
 * Restricted time periods when visits cannot be scheduled
 */
export const RESTRICTED_PERIODS = [
	{ start: 12 * 60, end: 13 * 60, label: "12:00-13:00" },
	{ start: 17 * 60, end: 18 * 60, label: "17:00-18:00" },
] as const;

/**
 * Checks if a time range overlaps with restricted periods
 */
export function checkRestrictedTimeOverlap(
	startTime: number,
	endTime: number,
): { overlaps: boolean; periods: string[] } {
	const overlappingPeriods: string[] = [];

	for (const period of RESTRICTED_PERIODS) {
		const overlaps = startTime < period.end && endTime > period.start;
		if (overlaps) {
			overlappingPeriods.push(period.label);
		}
	}

	return {
		overlaps: overlappingPeriods.length > 0,
		periods: overlappingPeriods,
	};
}

/**
 * Checks if a visit conflicts with existing visits
 */
export function checkVisitConflict(
	date: string,
	time: string,
	durationMinutes: number,
	existingVisits: Visit[],
	excludeVisitId?: string,
): { hasConflict: boolean; conflictingVisits: Visit[] } {
	const conflictingVisits = existingVisits.filter((visit) => {
		if (excludeVisitId && visit.id === excludeVisitId) return false;
		if (visit.date !== date) return false;

		const start1 = parseTime(time);
		const end1 = start1 + durationMinutes;
		const start2 = parseTime(visit.time);
		const end2 = start2 + visit.durationMinutes;

		return start1 < end2 && start2 < end1;
	});

	return {
		hasConflict: conflictingVisits.length > 0,
		conflictingVisits,
	};
}

/**
 * Validates a visit and returns an error message if invalid, or null if valid
 */
export function validateVisit(
	date: string,
	time: string,
	durationMinutes: number,
	existingVisits: Visit[],
	excludeVisitId?: string,
): string | null {
	if (!date || !time || !durationMinutes) return null;

	const start = parseTime(time);
	const end = start + durationMinutes;

	// First check restricted time periods
	const restrictedCheck = checkRestrictedTimeOverlap(start, end);
	if (restrictedCheck.overlaps) {
		return `Bezoeken kunnen niet overlappen met de maaltijd van ${restrictedCheck.periods.join(" en ")}. Kies een andere tijd.`;
	}

	// Then check conflicts with existing visits
	const conflictCheck = checkVisitConflict(
		date,
		time,
		durationMinutes,
		existingVisits,
		excludeVisitId,
	);

	if (conflictCheck.hasConflict) {
		const names = conflictCheck.conflictingVisits
			.map((v) => v.visitorName)
			.join(", ");
		return `Dit bezoek overlapt met een bestaand bezoek van ${names}. Kies een andere tijd of datum om conflicten te vermijden.`;
	}

	return null;
}

