interface VisitDetailItemProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

export default function VisitDetailItem({
	icon,
	label,
	value,
}: VisitDetailItemProps) {
	return (
		<div
			className="d-flex align-items-center visit-detail-item"
			style={{ flexWrap: "wrap", gap: "0.5rem" }}
		>
			<div
				style={{
					width: "32px",
					height: "32px",
					borderRadius: "8px",
					background: "var(--gray-100)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginRight: "0.75rem",
					flexShrink: 0,
				}}
			>
				{icon}
			</div>
			<span className="fw-semibold">{label}</span>
			<span style={{ color: "var(--gray-700)" }}>{value}</span>
		</div>
	);
}

