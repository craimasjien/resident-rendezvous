/**
 * Date formatting utilities for display purposes
 */

/**
 * Formats a date string (YYYY-MM-DD) to a long format (e.g., "maandag 15 januari 2024")
 */
export function formatDateLong(dateStr: string, locale: string = "nl"): string {
	const parsedDate = new Date(`${dateStr}T00:00:00`);
	if (Number.isNaN(parsedDate.getTime())) {
		return "Unknown date";
	}

	const formatter = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	return formatter.format(parsedDate);
}

/**
 * Formats a date string (YYYY-MM-DD) to a short format (e.g., "15-01-2024")
 */
export function formatDateShort(dateStr: string): string {
	const [year, month, day] = dateStr.split("-");
	return `${day}-${month}-${year}`;
}

