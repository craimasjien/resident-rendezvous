/**
 * Date calculation utilities for calendar operations
 */

/**
 * Gets the number of days in a given month
 */
export function getDaysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Gets the first day of the month as a Monday-based weekday (0=Monday, 6=Sunday)
 * JavaScript's getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
 * This converts to Monday-based: 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
export function getFirstDayOfMonth(date: Date): number {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const jsDay = firstDay.getDay();
	return jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-based week (Monday = 0)
}

/**
 * Formats a Date object to "YYYY-MM-DD" string in local timezone
 */
export function formatDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Formats a month and year for display (e.g., "januari 2024")
 */
export function formatMonthYear(date: Date, locale: string = "nl"): string {
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
	}).format(date);
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the past
 */
export function isDateInPast(dateStr: string): boolean {
	const todayStr = getTodayDateString();
	return dateStr < todayStr;
}

/**
 * Gets today's date as "YYYY-MM-DD" string in local timezone
 */
export function getTodayDateString(): string {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return formatDateString(today);
}

/**
 * Creates a Date object from a date string (YYYY-MM-DD) in local timezone
 */
export function parseDateString(dateStr: string): Date {
	const [year, month] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
}

/**
 * Creates a Date object for a specific day in a month
 */
export function createDateForDay(year: number, month: number, day: number): Date {
	return new Date(year, month, day);
}

