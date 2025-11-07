import type { Visit } from "@/types/visit";

/**
 * Sorts visits by date and time (ascending order)
 */
export function sortVisitsByDateAndTime(visits: Visit[]): Visit[] {
	return [...visits].sort((a, b) => {
		const dateCompare = a.date.localeCompare(b.date);
		if (dateCompare !== 0) {
			return dateCompare;
		}
		return a.time.localeCompare(b.time);
	});
}
