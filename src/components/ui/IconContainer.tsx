import type { ReactNode } from "react";

interface IconContainerProps {
	children: ReactNode;
	size?: number;
	variant?: "default" | "primary" | "circular";
	className?: string;
	style?: React.CSSProperties;
}

export default function IconContainer({
	children,
	size = 32,
	variant = "default",
	className = "",
	style,
}: IconContainerProps) {
	const isCircular = variant === "circular";
	const baseStyles: React.CSSProperties = {
		width: `${size}px`,
		height: `${size}px`,
		borderRadius: isCircular ? "50%" : "8px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginRight: variant === "primary" ? "1rem" : "0.75rem",
		flexShrink: 0,
		...(variant === "primary"
			? {
					background: "var(--gradient-primary)",
					boxShadow: "var(--shadow-md)",
				}
			: {
					background: "var(--gray-100)",
				}),
		...(style || {}),
	};

	return (
		<div className={className} style={baseStyles}>
			{children}
		</div>
	);
}
