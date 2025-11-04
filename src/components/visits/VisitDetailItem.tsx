import IconContainer from "@/components/ui/IconContainer";

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
			<IconContainer>{icon}</IconContainer>
			<span className="fw-semibold">{label}</span>
			<span style={{ color: "var(--gray-700)" }}>{value}</span>
		</div>
	);
}

