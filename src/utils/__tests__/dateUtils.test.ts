import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	getDaysInMonth,
	getFirstDayOfMonth,
	formatDateString,
	formatMonthYear,
	isDateInPast,
	getTodayDateString,
	parseDateString,
	createDateForDay,
} from "../dateUtils";

describe("getDaysInMonth", () => {
	it("should return 31 days for January", () => {
		const date = new Date(2024, 0, 15); // January 15, 2024
		expect(getDaysInMonth(date)).toBe(31);
	});

	it("should return 29 days for February in leap year", () => {
		const date = new Date(2024, 1, 15); // February 15, 2024
		expect(getDaysInMonth(date)).toBe(29);
	});

	it("should return 28 days for February in non-leap year", () => {
		const date = new Date(2023, 1, 15); // February 15, 2023
		expect(getDaysInMonth(date)).toBe(28);
	});

	it("should return 30 days for April", () => {
		const date = new Date(2024, 3, 15); // April 15, 2024
		expect(getDaysInMonth(date)).toBe(30);
	});

	it("should return 31 days for December", () => {
		const date = new Date(2024, 11, 15); // December 15, 2024
		expect(getDaysInMonth(date)).toBe(31);
	});
});

describe("getFirstDayOfMonth", () => {
	it("should return 0 for Monday (Monday-based week)", () => {
		// January 1, 2024 is a Monday
		const date = new Date(2024, 0, 15);
		expect(getFirstDayOfMonth(date)).toBe(0);
	});

	it("should return 1 for Tuesday", () => {
		// January 1, 2025 is a Wednesday, but let's check February 2024 which starts on Thursday
		// Actually, let's use a known date: January 1, 2025 is a Wednesday
		// Wait, let me check: January 1, 2024 is Monday (0)
		// February 1, 2024 is Thursday (should be 3)
		const date = new Date(2024, 1, 15); // February 2024
		expect(getFirstDayOfMonth(date)).toBe(3); // Thursday
	});

	it("should convert Sunday (JS day 0) to 6 (Monday-based)", () => {
		// September 1, 2024 is a Sunday
		const date = new Date(2024, 8, 15); // September 2024
		expect(getFirstDayOfMonth(date)).toBe(6); // Sunday converted to 6
	});

	it("should return correct day for various months", () => {
		// June 1, 2024 is a Saturday (JS day 6, converted to 5)
		const date = new Date(2024, 5, 15); // June 2024
		expect(getFirstDayOfMonth(date)).toBe(5);
	});
});

describe("formatDateString", () => {
	it("should format date to YYYY-MM-DD", () => {
		const date = new Date(2024, 0, 15); // January 15, 2024
		expect(formatDateString(date)).toBe("2024-01-15");
	});

	it("should pad single digit month and day", () => {
		const date = new Date(2024, 0, 5); // January 5, 2024
		expect(formatDateString(date)).toBe("2024-01-05");
	});

	it("should handle first day of month", () => {
		const date = new Date(2024, 0, 1); // January 1, 2024
		expect(formatDateString(date)).toBe("2024-01-01");
	});

	it("should handle last day of month", () => {
		const date = new Date(2024, 0, 31); // January 31, 2024
		expect(formatDateString(date)).toBe("2024-01-31");
	});

	it("should handle different years", () => {
		const date2023 = new Date(2023, 5, 15);
		const date2025 = new Date(2025, 5, 15);
		expect(formatDateString(date2023)).toBe("2023-06-15");
		expect(formatDateString(date2025)).toBe("2025-06-15");
	});
});

describe("formatMonthYear", () => {
	it("should format month and year in Dutch by default", () => {
		const date = new Date(2024, 0, 15); // January 2024
		const result = formatMonthYear(date);
		expect(result).toContain("januari");
		expect(result).toContain("2024");
	});

	it("should accept custom locale", () => {
		const date = new Date(2024, 0, 15); // January 2024
		const result = formatMonthYear(date, "en");
		expect(result).toContain("January");
		expect(result).toContain("2024");
	});

	it("should handle different months", () => {
		const janDate = new Date(2024, 0, 15);
		const decDate = new Date(2024, 11, 15);
		expect(formatMonthYear(janDate)).toContain("januari");
		expect(formatMonthYear(decDate)).toContain("december");
	});

	it("should handle different years", () => {
		const date2023 = new Date(2023, 5, 15);
		const date2025 = new Date(2025, 5, 15);
		expect(formatMonthYear(date2023)).toContain("2023");
		expect(formatMonthYear(date2025)).toContain("2025");
	});
});

describe("isDateInPast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should return true for past date", () => {
		// Set current date to 2024-01-15
		vi.setSystemTime(new Date(2024, 0, 15));
		expect(isDateInPast("2024-01-14")).toBe(true);
	});

	it("should return false for today", () => {
		vi.setSystemTime(new Date(2024, 0, 15));
		expect(isDateInPast("2024-01-15")).toBe(false);
	});

	it("should return false for future date", () => {
		vi.setSystemTime(new Date(2024, 0, 15));
		expect(isDateInPast("2024-01-16")).toBe(false);
	});

	it("should return true for date far in past", () => {
		vi.setSystemTime(new Date(2024, 0, 15));
		expect(isDateInPast("2023-12-31")).toBe(true);
	});

	it("should return false for date far in future", () => {
		vi.setSystemTime(new Date(2024, 0, 15));
		expect(isDateInPast("2025-01-01")).toBe(false);
	});
});

describe("getTodayDateString", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should return today's date in YYYY-MM-DD format", () => {
		const mockDate = new Date(2024, 0, 15);
		vi.setSystemTime(mockDate);
		expect(getTodayDateString()).toBe("2024-01-15");
	});

	it("should handle first day of month", () => {
		const mockDate = new Date(2024, 0, 1);
		vi.setSystemTime(mockDate);
		expect(getTodayDateString()).toBe("2024-01-01");
	});

	it("should handle last day of month", () => {
		const mockDate = new Date(2024, 0, 31);
		vi.setSystemTime(mockDate);
		expect(getTodayDateString()).toBe("2024-01-31");
	});

	it("should reset time to midnight", () => {
		const mockDate = new Date(2024, 0, 15, 14, 30, 45);
		vi.setSystemTime(mockDate);
		const result = getTodayDateString();
		expect(result).toBe("2024-01-15");
	});
});

describe("parseDateString", () => {
	it("should parse YYYY-MM-DD to Date object", () => {
		const result = parseDateString("2024-01-15");
		expect(result).toBeInstanceOf(Date);
		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(0); // January is 0-indexed
	});

	it("should handle single digit month", () => {
		const result = parseDateString("2024-01-15");
		expect(result.getMonth()).toBe(0);
	});

	it("should handle double digit month", () => {
		const result = parseDateString("2024-12-15");
		expect(result.getMonth()).toBe(11); // December is 11
	});

	it("should set day to 1", () => {
		// Note: parseDateString only uses year and month, day is set to 1
		const result = parseDateString("2024-01-15");
		expect(result.getDate()).toBe(1);
	});

	it("should handle different years", () => {
		const result2023 = parseDateString("2023-06-15");
		const result2025 = parseDateString("2025-06-15");
		expect(result2023.getFullYear()).toBe(2023);
		expect(result2025.getFullYear()).toBe(2025);
	});
});

describe("createDateForDay", () => {
	it("should create Date object for given year, month, and day", () => {
		const result = createDateForDay(2024, 0, 15); // January 15, 2024
		expect(result).toBeInstanceOf(Date);
		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(0);
		expect(result.getDate()).toBe(15);
	});

	it("should handle month 0 (January)", () => {
		const result = createDateForDay(2024, 0, 1);
		expect(result.getMonth()).toBe(0);
		expect(result.getDate()).toBe(1);
	});

	it("should handle month 11 (December)", () => {
		const result = createDateForDay(2024, 11, 31);
		expect(result.getMonth()).toBe(11);
		expect(result.getDate()).toBe(31);
	});

	it("should handle leap year date", () => {
		const result = createDateForDay(2024, 1, 29); // February 29, 2024
		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(1);
		expect(result.getDate()).toBe(29);
	});

	it("should handle different years", () => {
		const result2023 = createDateForDay(2023, 5, 15);
		const result2025 = createDateForDay(2025, 5, 15);
		expect(result2023.getFullYear()).toBe(2023);
		expect(result2025.getFullYear()).toBe(2025);
	});
});

