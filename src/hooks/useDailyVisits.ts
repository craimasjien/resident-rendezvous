import { useMemo } from "react";
import { useVisits } from "./useVisits";

/**
 * Hook that filters visits by a specific date
 */
export function useDailyVisits(selectedDate: string) {
	const { visits, isLoading, error } = useVisits();

	const dailyVisits = useMemo(
		() => visits.filter((visit) => visit.date === selectedDate),
		[visits, selectedDate],
	);

	return { dailyVisits, isLoading, error };
}
