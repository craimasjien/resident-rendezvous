import { describe, it, expect } from "vitest";
import { sanitizeText } from "../sanitize";

describe("sanitizeText", () => {
	it("should return empty string for null input", () => {
		expect(sanitizeText(null as unknown as string)).toBe("");
	});

	it("should return empty string for undefined input", () => {
		expect(sanitizeText(undefined as unknown as string)).toBe("");
	});

	it("should return empty string for non-string input", () => {
		expect(sanitizeText(123 as unknown as string)).toBe("");
		expect(sanitizeText({} as unknown as string)).toBe("");
		expect(sanitizeText([] as unknown as string)).toBe("");
	});

	it("should return empty string for empty string", () => {
		expect(sanitizeText("")).toBe("");
	});

	it("should return original text for safe input", () => {
		const safeText = "This is a safe text";
		expect(sanitizeText(safeText)).toBe(safeText);
	});

	it("should remove HTML tags", () => {
		expect(sanitizeText("<div>Hello</div>")).toBe("Hello");
		expect(sanitizeText("<p>Test</p>")).toBe("Test");
		// Script tag content remains after removing tags (script patterns don't remove alert('xss'))
		expect(sanitizeText("<script>alert('xss')</script>Hello")).toBe(
			"alert('xss')Hello",
		);
	});

	it("should remove nested HTML tags", () => {
		expect(sanitizeText("<div><span>Nested</span></div>")).toBe("Nested");
	});

	it("should remove javascript: protocol", () => {
		expect(sanitizeText("javascript:alert('xss')")).toBe("alert('xss')");
		expect(sanitizeText("JAVASCRIPT:alert('xss')")).toBe("alert('xss')");
		expect(sanitizeText("JavaScript:alert('xss')")).toBe("alert('xss')");
	});

	it("should remove event handlers", () => {
		expect(sanitizeText("<div onclick='alert(1)'>Test</div>")).toBe("Test");
		expect(sanitizeText("<img onerror='alert(1)' />")).toBe("");
		expect(sanitizeText("<a onmouseover='alert(1)'>Link</a>")).toBe("Link");
	});

	it("should remove script tags", () => {
		// Script tag content remains after removing tags, but script patterns are removed
		expect(sanitizeText("<script>alert('xss')</script>")).toBe("alert('xss')");
		expect(sanitizeText("<SCRIPT>alert('xss')</SCRIPT>")).toBe("alert('xss')");
		expect(sanitizeText("Hello<script>alert('xss')</script>World")).toBe(
			"Helloalert('xss')World",
		);
	});

	it("should remove CSS expression()", () => {
		expect(sanitizeText("expression(alert('xss'))")).toBe("alert('xss'))");
		expect(sanitizeText("EXPRESSION(alert('xss'))")).toBe("alert('xss'))");
	});

	it("should remove vbscript: protocol", () => {
		expect(sanitizeText("vbscript:alert('xss')")).toBe("alert('xss')");
		expect(sanitizeText("VBSCRIPT:alert('xss')")).toBe("alert('xss')");
	});

	it("should normalize whitespace", () => {
		expect(sanitizeText("Hello   World")).toBe("Hello World");
		expect(sanitizeText("Hello\t\tWorld")).toBe("Hello World");
		expect(sanitizeText("Hello\n\nWorld")).toBe("Hello World");
		expect(sanitizeText("Hello    \n    World")).toBe("Hello World");
	});

	it("should trim leading and trailing whitespace", () => {
		expect(sanitizeText("  Hello World  ")).toBe("Hello World");
		expect(sanitizeText("\tHello World\n")).toBe("Hello World");
	});

	it("should handle multiple attack vectors together", () => {
		const malicious =
			"<script>alert('xss')</script><div onclick='alert(1)'>Test</div>javascript:alert('xss')";
		const result = sanitizeText(malicious);
		// HTML tags removed, script patterns removed, but script content remains
		expect(result).toContain("Test");
		expect(result).not.toContain("<script>");
		expect(result).not.toContain("onclick");
		expect(result).not.toContain("javascript:");
	});

	it("should preserve normal text content", () => {
		const normalText = "This is a normal text with numbers 123 and symbols !@#";
		expect(sanitizeText(normalText)).toBe(normalText);
	});

	it("should handle mixed case attack vectors", () => {
		// Script tag content remains after removing tags
		expect(sanitizeText("<ScRiPt>alert('xss')</ScRiPt>")).toBe("alert('xss')");
		expect(sanitizeText("JaVaScRiPt:alert('xss')")).toBe("alert('xss')");
		expect(sanitizeText("<div OnClIcK='alert(1)'>Test</div>")).toBe("Test");
	});

	it("should handle text with legitimate use of 'on'", () => {
		const text = "The button is turned on";
		expect(sanitizeText(text)).toBe(text);
	});

	it("should handle URLs", () => {
		const url = "https://example.com/page";
		expect(sanitizeText(url)).toBe(url);
	});
});

