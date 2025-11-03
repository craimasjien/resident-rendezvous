import { useEffect, useRef } from "react";

interface VisitCalendarProps {
	selectedDate: string;
	onDateChange: (date: string) => void;
}

type BulmaCalendarSelectEvent = {
	data: {
		value: () => string | string[];
	};
};

type BulmaCalendarInstance = {
	value: (date?: string | Date) => string | string[] | undefined;
	on: (
		eventName: string,
		callback: (datepicker: BulmaCalendarSelectEvent) => void,
	) => void;
	destroy: () => void;
};

const normalizeSelectedValue = (value: string | string[]) => {
	if (Array.isArray(value)) {
		return (
			value.find((entry) => typeof entry === "string" && entry.length > 0) ??
			null
		);
	}

	return typeof value === "string" && value.length > 0 ? value : null;
};

export default function VisitCalendar({
	selectedDate,
	onDateChange,
}: VisitCalendarProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const calendarRef = useRef<BulmaCalendarInstance | null>(null);
	const initialSelectedDateRef = useRef(selectedDate);
	const onDateChangeRef = useRef(onDateChange);

	useEffect(() => {
		onDateChangeRef.current = onDateChange;
	}, [onDateChange]);

	useEffect(() => {
		if (typeof bulmaCalendar === "undefined") {
			console.warn(
				"bulmaCalendar script is not available. Ensure the CDN script is loaded.",
			);
			return;
		}

		if (!inputRef.current) {
			return;
		}

		const attachments = bulmaCalendar.attach(inputRef.current, {
			type: "date",
			displayMode: "inline",
			color: "primary",
			dateFormat: "yyyy-MM-dd",
			startDate: initialSelectedDateRef.current,
			showFooter: false,
			headerPosition: "left",
		}) as BulmaCalendarInstance[] | BulmaCalendarInstance | null;

		const calendarInstance = Array.isArray(attachments)
			? attachments[0]
			: (attachments ?? null);

		if (!calendarInstance) {
			console.warn(
				"bulmaCalendar failed to initialize for the provided element",
			);
			return;
		}

		calendarRef.current = calendarInstance;

		try {
			calendarInstance.value(initialSelectedDateRef.current);
		} catch (error) {
			console.warn("Unable to set initial calendar value", error);
		}

		calendarInstance.on("select", (datepicker) => {
			const selection = normalizeSelectedValue(datepicker.data.value());
			if (selection) {
				onDateChangeRef.current(selection);
			}
		});

		return () => {
			calendarInstance.destroy();
			calendarRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.value = selectedDate;
		}

		const calendarInstance = calendarRef.current;
		if (!calendarInstance) {
			return;
		}

		try {
			calendarInstance.value(selectedDate);
		} catch (error) {
			console.warn("Unable to sync calendar value", error);
		}
	}, [selectedDate]);

	return (
		<div className="visit-calendar">
			<header className="mb-4">
				<p className="title is-5">Select a day</p>
				<p className="subtitle is-6">
					The family agenda updates instantly as you browse.
				</p>
			</header>
			<input
				ref={inputRef}
				type="date"
				className="input"
				aria-label="Select visit date"
				defaultValue={selectedDate}
				style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
			/>
		</div>
	);
}
