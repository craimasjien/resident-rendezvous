import { describe, it, expect } from "vitest";
import { formatDateLong, formatDateShort } from "../dateFormatting";

describe("formatDateLong", () => {
	it("should format a valid date string to long format", () => {
		const result = formatDateLong("2024-01-15");
		expect(result).toBeTruthy();
		expect(result).not.toBe("Unknown date");
		// Should contain day name (in Dutch by default)
		expect(result).toMatch(/\w+/);
	});

	it("should use Dutch locale by default", () => {
		const result = formatDateLong("2024-01-15");
		// January 15, 2024 should be a Monday
		expect(result).toContain("15");
		expect(result).toContain("januari");
	});

	it("should accept custom locale", () => {
		const result = formatDateLong("2024-01-15", "en");
		expect(result).toBeTruthy();
		expect(result).toContain("15");
		expect(result).toContain("January");
	});

	it("should return 'Unknown date' for invalid date string", () => {
		const result = formatDateLong("invalid-date");
		expect(result).toBe("Unknown date");
	});

	it("should handle date at beginning of month", () => {
		const result = formatDateLong("2024-01-01");
		expect(result).toBeTruthy();
		expect(result).not.toBe("Unknown date");
	});

	it("should handle date at end of month", () => {
		const result = formatDateLong("2024-01-31");
		expect(result).toBeTruthy();
		expect(result).not.toBe("Unknown date");
	});

	it("should handle leap year date", () => {
		const result = formatDateLong("2024-02-29");
		expect(result).toBeTruthy();
		expect(result).not.toBe("Unknown date");
	});
});

describe("formatDateShort", () => {
	it("should format a valid date string to DD-MM-YYYY", () => {
		const result = formatDateShort("2024-01-15");
		expect(result).toBe("15-01-2024");
	});

	it("should handle single digit day and month", () => {
		const result = formatDateShort("2024-01-05");
		expect(result).toBe("05-01-2024");
	});

	it("should handle date at beginning of year", () => {
		const result = formatDateShort("2024-01-01");
		expect(result).toBe("01-01-2024");
	});

	it("should handle date at end of year", () => {
		const result = formatDateShort("2024-12-31");
		expect(result).toBe("31-12-2024");
	});

	it("should handle leap year date", () => {
		const result = formatDateShort("2024-02-29");
		expect(result).toBe("29-02-2024");
	});

	it("should handle different years", () => {
		expect(formatDateShort("2023-06-15")).toBe("15-06-2023");
		expect(formatDateShort("2025-06-15")).toBe("15-06-2025");
	});
});

