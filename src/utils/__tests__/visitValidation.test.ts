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
	it("should return null for a valid visit", () => {
		const result = validateVisit("2024-01-15", "10:00", 60, []);
		expect(result).toBeNull();
	});

	it("should reject visit during restricted periods", () => {
		const result = validateVisit("2024-01-15", "12:30", 30, []);
		expect(result).toBeTruthy();
		expect(result).toContain("maaltijden");
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

	it("should prioritize restricted periods over conflicts", () => {
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
		expect(result).toContain("maaltijden");
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

