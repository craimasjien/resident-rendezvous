interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export default function LoadingSpinner({
	size = "sm",
	className = "",
}: LoadingSpinnerProps) {
	const sizeClass = size === "sm" ? "spinner-border-sm" : "";
	const spacingClass = size === "sm" ? "me-2" : "";

	return (
		<span
			className={`spinner-border ${sizeClass} ${spacingClass} ${className}`.trim()}
			role="status"
			aria-hidden="true"
		></span>
	);
}
