/**
 * Time calculation and formatting utilities
 */

/**
 * Parses a time string (HH:MM) to minutes since midnight
 */
export function parseTime(timeStr: string): number {
	const [h, m] = timeStr.split(":").map(Number);
	return h * 60 + m;
}

/**
 * Calculates departure time from arrival time and duration
 */
export function calculateDepartureTime(
	arrivalTime: string,
	durationMinutes: number,
): string {
	const [hours, minutes] = arrivalTime.split(":").map(Number);
	const arrivalDate = new Date();
	arrivalDate.setHours(hours, minutes, 0, 0);

	const departureDate = new Date(
		arrivalDate.getTime() + durationMinutes * 60000,
	);
	const departureHours = departureDate.getHours().toString().padStart(2, "0");
	const departureMinutes = departureDate
		.getMinutes()
		.toString()
		.padStart(2, "0");

	return `${departureHours}:${departureMinutes}`;
}

/**
 * Formats duration in minutes to a human-readable string (Dutch)
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} ${minutes === 1 ? "minuut" : "minuten"}`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours} ${hours === 1 ? "uur" : "uren"}`;
	}

	return `${hours} uur en ${remainingMinutes} minuten`;
}

