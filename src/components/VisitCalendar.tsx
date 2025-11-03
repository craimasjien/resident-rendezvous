import { useEffect, useMemo, useState } from "react";
import { useVisits } from "@/hooks/useVisits";

interface VisitCalendarProps {
	selectedDate: string;
	onDateChange: (date: string) => void;
}

export default function VisitCalendar({
	selectedDate,
	onDateChange,
}: VisitCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(() => {
		// Parse date string and create date in local timezone
		const [year, month] = selectedDate.split("-").map(Number);
		return new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
	});
	const { visits, isLoading: visitsLoading } = useVisits();

	// Memoize processed visit dates
	const visitDates = useMemo(
		() => new Set(visits.map((visit) => visit.date)),
		[visits],
	);

	// Get first day of month and number of days
	const getDaysInMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date: Date) => {
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		// JavaScript getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
		// We want: 0=Monday, 1=Tuesday, ..., 6=Sunday
		const jsDay = firstDay.getDay();
		return jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-based week (Monday = 0)
	};

	const daysInMonth = getDaysInMonth(currentMonth);
	const firstDay = getFirstDayOfMonth(currentMonth);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	// Format today in local timezone to avoid UTC conversion issues
	const todayYear = today.getFullYear();
	const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
	const todayDay = String(today.getDate()).padStart(2, "0");
	const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

	const handleDateClick = (day: number) => {
		const date = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			day,
		);
		// Format date in local timezone to avoid UTC conversion issues
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const dayStr = String(date.getDate()).padStart(2, "0");
		const dateStr = `${year}-${month}-${dayStr}`;

		// Don't allow selecting dates in the past
		if (dateStr < todayStr) {
			return;
		}

		onDateChange(dateStr);
	};

	const handlePrevMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
		);
	};

	const handleNextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
		);
	};

	const formatMonthYear = (date: Date) => {
		return new Intl.DateTimeFormat("nl", {
			month: "long",
			year: "numeric",
		}).format(date);
	};

	// Update current month when selectedDate changes externally (but not when currentMonth changes internally)
	useEffect(() => {
		const [year, month] = selectedDate.split("-").map(Number);
		const newMonth = new Date(year, month - 1, 1); // month is 0-indexed
		setCurrentMonth((prevMonth) => {
			const prevMonthTime = new Date(
				prevMonth.getFullYear(),
				prevMonth.getMonth(),
				1,
			).getTime();
			const newMonthTime = newMonth.getTime();
			// Only update if the month actually changed
			if (newMonthTime !== prevMonthTime) {
				return newMonth;
			}
			return prevMonth;
		});
	}, [selectedDate]);

	const renderCalendarGrid = () => {
		const cells = [];
		const weekdays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
		const totalCells = 49; // 7 rows × 7 days = 49 cells (1 row for weekdays + 6 rows for dates)

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
			const date = new Date(
				currentMonth.getFullYear(),
				currentMonth.getMonth(),
				day,
			);
			// Format date in local timezone to avoid UTC conversion issues
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const dayStr = String(date.getDate()).padStart(2, "0");
			const dateStr = `${year}-${month}-${dayStr}`;
			const isToday = dateStr === todayStr;
			const isSelected = dateStr === selectedDate;
			const hasVisits = visitDates.has(dateStr);
			const isPast = dateStr < todayStr;

			cells.push(
				<button
					key={day}
					type="button"
					className={`calendar-day ${isPast ? "past" : ""} ${isSelected ? "selected" : ""} ${hasVisits ? "has-visits" : ""} ${isToday ? "today" : ""}`}
					onClick={() => !isPast && handleDateClick(day)}
					disabled={isPast}
					onKeyDown={(e) => {
						if (!isPast && (e.key === "Enter" || e.key === " ")) {
							e.preventDefault();
							handleDateClick(day);
						}
					}}
					aria-label={
						isPast ? `Past date: ${dateStr}` : `Select date: ${dateStr}`
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

		return cells;
	};

	return (
		<div className="visit-calendar">
			<header className="mb-5" style={{ marginBottom: "2.5rem" }}>
				<h2 className="h5" style={{ marginBottom: "1rem" }}>
					Selecteer een dag
				</h2>
				<p
					className="text-muted mb-0"
					style={{
						marginBottom: "0",
						lineHeight: "1.7",
						minHeight: "3rem",
						paddingBottom: "0.5rem",
					}}
				>
					De agenda wordt direct bijgewerkt wanneer je bladert.
				</p>
			</header>
			{visitsLoading ? (
				<div className="text-center py-4">
					<span className="text-secondary">Agenda laden...</span>
				</div>
			) : (
				<div className="calendar-container">
					<div className="calendar-header d-flex justify-content-between align-items-center mb-3">
						<button
							type="button"
							className="btn btn-sm btn-outline-primary"
							onClick={handlePrevMonth}
							aria-label="Previous month"
						>
							←
						</button>
						<h3 className="h6 mb-0">{formatMonthYear(currentMonth)}</h3>
						<button
							type="button"
							className="btn btn-sm btn-outline-primary"
							onClick={handleNextMonth}
							aria-label="Next month"
						>
							→
						</button>
					</div>
					<div className="calendar-grid">{renderCalendarGrid()}</div>
				</div>
			)}
		</div>
	);
}
