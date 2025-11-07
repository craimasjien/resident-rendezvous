import React from "react";

interface ErrorAlertProps {
	message: string | React.ReactNode;
	variant?: "danger" | "warning" | "info";
	className?: string;
}

export default function ErrorAlert({
	message,
	variant = "danger",
	className = "",
}: ErrorAlertProps) {
	return (
		<div className={`alert alert-${variant} mb-4 ${className}`.trim()} role="alert">
			{message}
		</div>
	);
}
