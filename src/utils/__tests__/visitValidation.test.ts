import { describe, it, expect } from "vitest";
import { validateVisit, checkSameDayVisit } from "../visitValidation";
import type { Visit } from "@/types/visit";

const mockUserId = "user123";

const createMockVisit = (
	id: string,
	date: string,
	time: string,
	durationMinutes: number,
	visitorName: string = "Test Visitor",
): Visit => ({
	id,
	date,
	time,
	durationMinutes,
	visitorName,
	userId: mockUserId,
});

describe("validateVisit", () => {
	// 2024-01-15 is a Monday
	it("should return null for a valid visit on weekday (morning)", () => {
		const result = validateVisit("2024-01-15", "10:00", 60, []);
		expect(result).toBeNull();
	});

	it("should return null for a valid visit on weekday (afternoon)", () => {
		const result = validateVisit("2024-01-15", "16:00", 60, []);
		expect(result).toBeNull();
	});

	it("should return null for a valid visit on weekday (evening)", () => {
		const result = validateVisit("2024-01-15", "19:00", 60, []);
		expect(result).toBeNull();
	});

	// 2024-01-13 is a Saturday
	it("should return null for a valid visit on weekend", () => {
		const result = validateVisit("2024-01-13", "14:00", 60, []);
		expect(result).toBeNull();
	});

	it("should reject visit outside allowed hours on weekday (lunch break)", () => {
		const result = validateVisit("2024-01-15", "12:30", 30, []);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
	});

	it("should reject visit outside allowed hours on weekday (too early)", () => {
		const result = validateVisit("2024-01-15", "08:00", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
	});

	it("should allow visit exactly at allowed period boundaries on weekday", () => {
		// Visit starting at 09:00 and ending at 10:00 should be allowed
		expect(validateVisit("2024-01-15", "09:00", 60, [])).toBeNull();
		// Visit starting at 11:00 and ending at 12:00 should be allowed
		expect(validateVisit("2024-01-15", "11:00", 60, [])).toBeNull();
		// Visit starting at 15:00 and ending at 16:00 should be allowed
		expect(validateVisit("2024-01-15", "15:00", 60, [])).toBeNull();
		// Visit starting at 16:00 and ending at 17:00 should be allowed
		expect(validateVisit("2024-01-15", "16:00", 60, [])).toBeNull();
		// Visit starting at 18:00 and ending at 19:00 should be allowed
		expect(validateVisit("2024-01-15", "18:00", 60, [])).toBeNull();
		// Visit starting at 21:00 and ending at 22:00 should be allowed
		expect(validateVisit("2024-01-15", "21:00", 60, [])).toBeNull();
	});

	it("should reject visit during the gap between 17:00-18:00 on weekday", () => {
		// Visit starting at 17:00 should be rejected (ends at 18:00, but starts in previous period)
		const result1 = validateVisit("2024-01-15", "17:00", 60, []);
		expect(result1).toBeTruthy();
		expect(result1).toContain("werkdagen");
		
		// Visit starting at 17:30 should be rejected
		const result2 = validateVisit("2024-01-15", "17:30", 30, []);
		expect(result2).toBeTruthy();
		expect(result2).toContain("werkdagen");
	});

	it("should reject visit that spans across the 17:00-18:00 gap", () => {
		// Visit starting at 16:30 with 60 min duration ends at 17:30 - spans across gap
		const result = validateVisit("2024-01-15", "16:30", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
	});

	it("should reject visit that spans across boundary on weekday", () => {
		// Visit starting at 11:30 with 60 min duration ends at 12:30 - spans across boundary
		const result = validateVisit("2024-01-15", "11:30", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
	});

	it("should allow visit exactly at allowed period boundaries on weekend", () => {
		// Visit starting at 09:00 and ending at 10:00 should be allowed
		expect(validateVisit("2024-01-13", "09:00", 60, [])).toBeNull();
		// Visit starting at 21:00 and ending at 22:00 should be allowed
		expect(validateVisit("2024-01-13", "21:00", 60, [])).toBeNull();
	});

	it("should reject visit that spans across boundary on weekend", () => {
		// Visit starting at 21:30 with 60 min duration ends at 22:30 - spans across boundary
		const result = validateVisit("2024-01-13", "21:30", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("zaterdag en zondag");
	});

	it("should reject visit outside allowed hours on weekday (too late)", () => {
		const result = validateVisit("2024-01-15", "21:30", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
	});

	it("should reject visit outside allowed hours on weekend (too early)", () => {
		const result = validateVisit("2024-01-13", "08:00", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("zaterdag en zondag");
	});

	it("should reject visit outside allowed hours on weekend (too late)", () => {
		const result = validateVisit("2024-01-13", "21:30", 60, []);
		expect(result).toBeTruthy();
		expect(result).toContain("zaterdag en zondag");
	});

	it("should reject visit that conflicts with existing visit", () => {
		const existingVisit = createMockVisit(
			"visit1",
			"2024-01-15",
			"10:00",
			60,
			"John Doe",
		);
		const result = validateVisit(
			"2024-01-15",
			"10:30",
			60,
			[existingVisit],
		);
		expect(result).toBeTruthy();
		expect(result).toContain("overlapt");
		expect(result).toContain("John Doe");
	});

	it("should exclude visit when excludeVisitId matches", () => {
		const existingVisit = createMockVisit(
			"visit1",
			"2024-01-15",
			"10:00",
			60,
		);
		const result = validateVisit(
			"2024-01-15",
			"10:00",
			60,
			[existingVisit],
			"visit1",
		);
		expect(result).toBeNull();
	});

	it("should return null for empty inputs", () => {
		expect(validateVisit("", "10:00", 60, [])).toBeNull();
		expect(validateVisit("2024-01-15", "", 60, [])).toBeNull();
		expect(validateVisit("2024-01-15", "10:00", 0, [])).toBeNull();
	});

	it("should prioritize allowed hours check over conflicts", () => {
		const existingVisit = createMockVisit(
			"visit1",
			"2024-01-15",
			"12:30",
			60,
			"Conflicting Visitor",
		);
		const result = validateVisit(
			"2024-01-15",
			"12:30",
			60,
			[existingVisit],
		);
		expect(result).toBeTruthy();
		expect(result).toContain("werkdagen");
		expect(result).not.toContain("Conflicting Visitor");
	});
});

describe("checkSameDayVisit", () => {
	it("should return false when no visits exist", () => {
		const result = checkSameDayVisit("2024-01-15", []);
		expect(result.hasSameDayVisit).toBe(false);
		expect(result.sameDayVisits).toEqual([]);
	});

	it("should return false when visits exist on different dates", () => {
		const existingVisit = createMockVisit(
			"visit1",
			"2024-01-14",
			"10:00",
			60,
		);
		const result = checkSameDayVisit("2024-01-15", [existingVisit]);
		expect(result.hasSameDayVisit).toBe(false);
		expect(result.sameDayVisits).toEqual([]);
	});

	it("should return true when visit exists on same date", () => {
		const existingVisit = createMockVisit(
			"visit1",
			"2024-01-15",
			"10:00",
			60,
		);
		const result = checkSameDayVisit("2024-01-15", [existingVisit]);
		expect(result.hasSameDayVisit).toBe(true);
		expect(result.sameDayVisits).toEqual([existingVisit]);
	});

	it("should return all visits on same date", () => {
		const visit1 = createMockVisit("visit1", "2024-01-15", "10:00", 60);
		const visit2 = createMockVisit("visit2", "2024-01-15", "15:00", 60);
		const otherDateVisit = createMockVisit(
			"visit3",
			"2024-01-14",
			"10:00",
			60,
		);
		const result = checkSameDayVisit("2024-01-15", [
			visit1,
			visit2,
			otherDateVisit,
		]);
		expect(result.hasSameDayVisit).toBe(true);
		expect(result.sameDayVisits).toHaveLength(2);
		expect(result.sameDayVisits).toContain(visit1);
		expect(result.sameDayVisits).toContain(visit2);
		expect(result.sameDayVisits).not.toContain(otherDateVisit);
	});

	it("should exclude visit when excludeVisitId matches", () => {
		const visit1 = createMockVisit("visit1", "2024-01-15", "10:00", 60);
		const visit2 = createMockVisit("visit2", "2024-01-15", "15:00", 60);
		const result = checkSameDayVisit("2024-01-15", [visit1, visit2], "visit1");
		expect(result.hasSameDayVisit).toBe(true);
		expect(result.sameDayVisits).toEqual([visit2]);
	});
});

