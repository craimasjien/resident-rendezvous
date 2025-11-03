/**
 * Sanitizes user input to prevent script injection.
 * Removes HTML tags and common script patterns.
 *
 * @param input - The user input string to sanitize
 * @returns A sanitized string safe for display
 */
export function sanitizeText(input: string): string {
	if (!input || typeof input !== 'string') {
		return '';
	}

	// Remove HTML tags
	let sanitized = input.replace(/<[^>]*>/g, '');

	// Remove common script patterns (case-insensitive)
	const scriptPatterns = [
		/javascript:/gi,
		/on\w+\s*=/gi, // Event handlers like onclick=
		/<script/gi,
		/<\/script>/gi,
		/expression\s*\(/gi, // CSS expression()
		/vbscript:/gi,
	];

	for (const pattern of scriptPatterns) {
		sanitized = sanitized.replace(pattern, '');
	}

	// Trim and normalize whitespace
	return sanitized.trim().replace(/\s+/g, ' ');
}

