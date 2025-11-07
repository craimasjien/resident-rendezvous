import {
	createDateForDay,
	formatDateString,
	getDaysInMonth,
	getFirstDayOfMonth,
} from "@/utils/dateUtils";

interface CalendarGridProps {
	currentMonth: Date;
	selectedDate: string;
	todayStr: string;
	visitDates: Set<string>;
	blockedDates: Set<string>;
	onDateClick: (day: number) => void;
}

export default function CalendarGrid({
	currentMonth,
	selectedDate,
	todayStr,
	visitDates,
	blockedDates,
	onDateClick,
}: CalendarGridProps) {
	const daysInMonth = getDaysInMonth(currentMonth);
	const firstDay = getFirstDayOfMonth(currentMonth);
	const weekdays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
	const totalCells = 49; // 7 rows × 7 days = 49 cells (1 row for weekdays + 6 rows for dates)

	const cells = [];

	// First row: Weekday headers
	weekdays.forEach((day) => {
		cells.push(
			<div key={`weekday-${day}`} className="calendar-weekday fw-semibold">
				{day}
			</div>,
		);
	});

	// Empty cells for days before month starts
	for (let i = 0; i < firstDay; i++) {
		cells.push(
			<div key={`empty-start-${i}`} className="calendar-day empty"></div>,
		);
	}

	// Days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		const date = createDateForDay(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			day,
		);
		const dateStr = formatDateString(date);
		const isToday = dateStr === todayStr;
		const isSelected = dateStr === selectedDate;
		const hasVisits = visitDates.has(dateStr);
		const isBlocked = blockedDates.has(dateStr);
		const isPast = dateStr < todayStr;

		cells.push(
			<button
				key={day}
				type="button"
				className={`calendar-day ${isPast ? "past" : ""} ${isSelected ? "selected" : ""} ${hasVisits ? "has-visits" : ""} ${isBlocked ? "blocked" : ""} ${isToday ? "today" : ""}`}
				onClick={() => !isPast && onDateClick(day)}
				disabled={isPast}
				onKeyDown={(e) => {
					if (!isPast && (e.key === "Enter" || e.key === " ")) {
						e.preventDefault();
						onDateClick(day);
					}
				}}
				aria-label={
					isPast 
						? `Past date: ${dateStr}` 
						: isBlocked 
							? `Blocked date: ${dateStr}` 
							: `Select date: ${dateStr}`
				}
			>
				<span className="day-number">{day}</span>
				{hasVisits && (
					<span className="visit-indicator" aria-hidden="true"></span>
				)}
			</button>,
		);
	}

	// Pad with empty cells at the end to ensure exactly 7 rows (49 cells total)
	const cellsUsed = 7 + firstDay + daysInMonth; // 7 weekdays + empty cells + days
	const cellsNeeded = totalCells - cellsUsed;
	for (let i = 0; i < cellsNeeded; i++) {
		cells.push(
			<div key={`empty-end-${i}`} className="calendar-day empty"></div>,
		);
	}

	return <div className="calendar-grid">{cells}</div>;
}
