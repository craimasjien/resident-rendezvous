import { describe, it, expect } from "vitest";
import {
	parseTime,
	calculateDepartureTime,
	formatDuration,
} from "../timeUtils";

describe("parseTime", () => {
	it("should parse HH:MM to minutes since midnight", () => {
		expect(parseTime("00:00")).toBe(0);
		expect(parseTime("00:30")).toBe(30);
		expect(parseTime("01:00")).toBe(60);
		expect(parseTime("12:00")).toBe(720);
		expect(parseTime("23:59")).toBe(1439);
	});

	it("should handle single digit hours and minutes", () => {
		expect(parseTime("01:05")).toBe(65);
		expect(parseTime("09:09")).toBe(549);
	});

	it("should handle morning times", () => {
		expect(parseTime("08:00")).toBe(480);
		expect(parseTime("10:30")).toBe(630);
	});

	it("should handle afternoon times", () => {
		expect(parseTime("14:00")).toBe(840);
		expect(parseTime("15:45")).toBe(945);
	});

	it("should handle evening times", () => {
		expect(parseTime("20:00")).toBe(1200);
		expect(parseTime("22:30")).toBe(1350);
	});

	it("should handle midnight", () => {
		expect(parseTime("00:00")).toBe(0);
	});

	it("should handle end of day", () => {
		expect(parseTime("23:59")).toBe(1439);
	});
});

describe("calculateDepartureTime", () => {
	it("should calculate departure time for 30 minute visit", () => {
		expect(calculateDepartureTime("10:00", 30)).toBe("10:30");
	});

	it("should calculate departure time for 60 minute visit", () => {
		expect(calculateDepartureTime("10:00", 60)).toBe("11:00");
	});

	it("should calculate departure time for 90 minute visit", () => {
		expect(calculateDepartureTime("10:00", 90)).toBe("11:30");
	});

	it("should handle departure time crossing hour boundary", () => {
		expect(calculateDepartureTime("10:45", 30)).toBe("11:15");
	});

	it("should handle departure time crossing multiple hours", () => {
		expect(calculateDepartureTime("10:00", 120)).toBe("12:00");
		expect(calculateDepartureTime("10:00", 180)).toBe("13:00");
	});

	it("should handle departure time crossing midnight", () => {
		expect(calculateDepartureTime("23:30", 60)).toBe("00:30");
	});

	it("should handle departure time at end of day", () => {
		expect(calculateDepartureTime("23:45", 15)).toBe("00:00");
	});

	it("should pad single digit hours and minutes", () => {
		expect(calculateDepartureTime("09:55", 10)).toBe("10:05");
		expect(calculateDepartureTime("00:05", 5)).toBe("00:10");
	});

	it("should handle morning times", () => {
		expect(calculateDepartureTime("08:00", 30)).toBe("08:30");
		expect(calculateDepartureTime("08:15", 45)).toBe("09:00");
	});

	it("should handle afternoon times", () => {
		expect(calculateDepartureTime("14:00", 60)).toBe("15:00");
		expect(calculateDepartureTime("14:30", 90)).toBe("16:00");
	});

	it("should handle evening times", () => {
		expect(calculateDepartureTime("20:00", 60)).toBe("21:00");
		expect(calculateDepartureTime("21:30", 30)).toBe("22:00");
	});

	it("should handle zero duration", () => {
		expect(calculateDepartureTime("10:00", 0)).toBe("10:00");
	});

	it("should handle single minute duration", () => {
		expect(calculateDepartureTime("10:00", 1)).toBe("10:01");
	});
});

describe("formatDuration", () => {
	it("should format minutes less than 60", () => {
		expect(formatDuration(0)).toBe("0 minuten");
		expect(formatDuration(1)).toBe("1 minuut");
		expect(formatDuration(30)).toBe("30 minuten");
		expect(formatDuration(59)).toBe("59 minuten");
	});

	it("should format exactly 60 minutes", () => {
		expect(formatDuration(60)).toBe("1 uur");
	});

	it("should format hours without remaining minutes", () => {
		expect(formatDuration(120)).toBe("2 uren");
		expect(formatDuration(180)).toBe("3 uren");
		expect(formatDuration(240)).toBe("4 uren");
	});

	it("should format hours with remaining minutes", () => {
		expect(formatDuration(90)).toBe("1 uur en 30 minuten");
		expect(formatDuration(150)).toBe("2 uur en 30 minuten");
		expect(formatDuration(125)).toBe("2 uur en 5 minuten");
	});

	it("should handle singular hour", () => {
		expect(formatDuration(61)).toBe("1 uur en 1 minuten");
		expect(formatDuration(90)).toBe("1 uur en 30 minuten");
	});

	it("should handle multiple hours", () => {
		expect(formatDuration(121)).toBe("2 uur en 1 minuten");
		expect(formatDuration(150)).toBe("2 uur en 30 minuten");
		expect(formatDuration(185)).toBe("3 uur en 5 minuten");
	});

	it("should handle large durations", () => {
		expect(formatDuration(300)).toBe("5 uren");
		expect(formatDuration(390)).toBe("6 uur en 30 minuten");
		expect(formatDuration(480)).toBe("8 uren");
	});

	it("should handle edge cases", () => {
		expect(formatDuration(59)).toBe("59 minuten");
		expect(formatDuration(60)).toBe("1 uur");
		expect(formatDuration(61)).toBe("1 uur en 1 minuten");
		expect(formatDuration(119)).toBe("1 uur en 59 minuten");
		expect(formatDuration(120)).toBe("2 uren");
	});
});

