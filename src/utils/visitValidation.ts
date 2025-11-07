/**
 * Business rules and validation logic for visits
 */

import type { Visit } from "@/types/visit";
import { parseTime } from "./timeUtils";

/**
 * Gets the day of week from a date string (YYYY-MM-DD)
 * Returns 0-6 where 0 = Monday, 6 = Sunday
 */
function getDayOfWeek(dateStr: string): number {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	return jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-based (0 = Monday, 6 = Sunday)
}

/**
 * Allowed time periods for visits
 * Monday-Friday: 09:00-12:00, 15:00-17:00, 18:00-22:00
 * Saturday-Sunday: 09:00-22:00
 */
function getAllowedPeriods(dateStr: string): Array<{ start: number; end: number }> {
	const dayOfWeek = getDayOfWeek(dateStr);
	const isWeekend = dayOfWeek >= 5; // Saturday (5) or Sunday (6)

	if (isWeekend) {
		// Weekend: 09:00-22:00
		return [{ start: 9 * 60, end: 22 * 60 }];
	} else {
		// Weekday: 09:00-12:00, 15:00-17:00, 18:00-22:00
		return [
			{ start: 9 * 60, end: 12 * 60 },
			{ start: 15 * 60, end: 17 * 60 },
			{ start: 18 * 60, end: 22 * 60 },
		];
	}
}

/**
 * Checks if a time range falls within allowed periods
 */
export function checkAllowedTimeRange(
	dateStr: string,
	startTime: number,
	endTime: number,
): { isAllowed: boolean; allowedPeriods: Array<{ start: number; end: number }> } {
	const allowedPeriods = getAllowedPeriods(dateStr);

	// Check if the visit time range is completely within any allowed period
	for (const period of allowedPeriods) {
		if (startTime >= period.start && endTime <= period.end) {
			return { isAllowed: true, allowedPeriods };
		}
	}

	return { isAllowed: false, allowedPeriods };
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

export function checkSameDayVisit(
	date: string,
	existingVisits: Visit[],
	excludeVisitId?: string,
): { hasSameDayVisit: boolean; sameDayVisits: Visit[] } {
	const sameDayVisits = existingVisits.filter((visit) => {
		if (excludeVisitId && visit.id === excludeVisitId) return false;
		if (visit.date !== date) return false;
		return true;
	});
	return {
		hasSameDayVisit: sameDayVisits.length > 0,
		sameDayVisits,
	};
}

/**
 * Checks if a visit conflicts with a blocked timeslot
 */
export function checkBlockedTimeslotConflict(
	date: string,
	time: string,
	durationMinutes: number,
	blockedTimeslot: { date: string; time: string; durationMinutes: number; message: string },
): boolean {
	if (blockedTimeslot.date !== date) return false;

	const start1 = parseTime(time);
	const end1 = start1 + durationMinutes;
	const start2 = parseTime(blockedTimeslot.time);
	const end2 = start2 + blockedTimeslot.durationMinutes;

	// Check if time ranges overlap
	return start1 < end2 && start2 < end1;
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

	// First check if the time falls within allowed periods
	const allowedCheck = checkAllowedTimeRange(date, start, end);
	if (!allowedCheck.isAllowed) {
		const dayOfWeek = getDayOfWeek(date);
		const isWeekend = dayOfWeek >= 5;
		
		if (isWeekend) {
			return `Bezoeken kunnen alleen gepland worden tussen 09:00-22:00 op zaterdag en zondag. Kies een andere tijd.`;
		} else {
			return `Bezoeken kunnen alleen gepland worden tussen 09:00-12:00, 15:00-17:00 en 18:00-22:00 op werkdagen (maandag-vrijdag). Kies een andere tijd.`;
		}
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

