import { useEffect, useMemo, useState } from "react";
import { useVisits } from "@/hooks/useVisits";
import {
	createDateForDay,
	formatDateString,
	getTodayDateString,
	parseDateString,
} from "@/utils/dateUtils";
import CalendarGrid from "./calendar/CalendarGrid";
import CalendarHeader from "./calendar/CalendarHeader";

interface VisitCalendarProps {
	selectedDate: string;
	onDateChange: (date: string) => void;
}

export default function VisitCalendar({
	selectedDate,
	onDateChange,
}: VisitCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(() =>
		parseDateString(selectedDate),
	);
	const { visits, isLoading: visitsLoading } = useVisits();

	// Memoize processed visit dates
	const visitDates = useMemo(
		() => new Set(visits.map((visit) => visit.date)),
		[visits],
	);

	const todayStr = getTodayDateString();

	const handleDateClick = (day: number) => {
		const date = createDateForDay(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			day,
		);
		const dateStr = formatDateString(date);

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

	// Update current month when selectedDate changes externally (but not when currentMonth changes internally)
	useEffect(() => {
		const newMonth = parseDateString(selectedDate);
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

	return (
		<div className="visit-calendar">
			<header className="calendar-header-section">
				<h2 className="calendar-title">Selecteer een dag</h2>
				<p className="calendar-description">
					De agenda wordt direct bijgewerkt wanneer je bladert.
				</p>
			</header>
			{visitsLoading ? (
				<div className="text-center py-4">
					<span className="text-secondary">Agenda laden...</span>
				</div>
			) : (
				<div className="calendar-container">
					<CalendarHeader
						currentMonth={currentMonth}
						onPrevMonth={handlePrevMonth}
						onNextMonth={handleNextMonth}
					/>
					<CalendarGrid
						currentMonth={currentMonth}
						selectedDate={selectedDate}
						todayStr={todayStr}
						visitDates={visitDates}
						onDateClick={handleDateClick}
					/>
				</div>
			)}
		</div>
	);
}
