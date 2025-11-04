import { formatMonthYear } from "@/utils/dateUtils";

interface CalendarHeaderProps {
	currentMonth: Date;
	onPrevMonth: () => void;
	onNextMonth: () => void;
}

export default function CalendarHeader({
	currentMonth,
	onPrevMonth,
	onNextMonth,
}: CalendarHeaderProps) {
	return (
		<div className="calendar-header d-flex justify-content-between align-items-center mb-3">
			<button
				type="button"
				className="btn btn-sm btn-outline-primary"
				onClick={onPrevMonth}
				aria-label="Previous month"
			>
				←
			</button>
			<h3 className="h6 mb-0">{formatMonthYear(currentMonth)}</h3>
			<button
				type="button"
				className="btn btn-sm btn-outline-primary"
				onClick={onNextMonth}
				aria-label="Next month"
			>
				→
			</button>
		</div>
	);
}
