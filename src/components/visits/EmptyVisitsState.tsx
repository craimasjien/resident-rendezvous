interface EmptyVisitsStateProps {
	isLoading: boolean;
	error: Error | null;
}

export default function EmptyVisitsState({
	isLoading,
	error,
}: EmptyVisitsStateProps) {
	if (isLoading || error) {
		return null;
	}

	return (
		<div
			className="alert alert-light"
			role="status"
			style={{
				textAlign: "center",
				padding: "3rem 2rem",
				background:
					"linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
				border: "2px dashed var(--gray-300)",
				borderRadius: "var(--radius-xl)",
			}}
		>
			<p
				style={{
					fontSize: "1.125rem",
					color: "var(--gray-700)",
					margin: 0,
					fontWeight: "500",
				}}
			>
				Er zijn nog geen bezoeken gepland. Wees de eerste die langskomt! 🎉
			</p>
		</div>
	);
}

