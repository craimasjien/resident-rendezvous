import { useEffect, useRef, useState } from "react";

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

const getSelectedValue = (value: string | string[]): string | null => {
	const str = Array.isArray(value) ? value.find((v) => typeof v === "string" && v) : value;
	return typeof str === "string" && str ? str : null;
};

const waitForBulmaCalendar = (): Promise<typeof bulmaCalendar> => {
	return new Promise((resolve, reject) => {
		if (typeof bulmaCalendar !== "undefined") {
			resolve(bulmaCalendar);
			return;
		}

		const checkInterval = setInterval(() => {
			if (typeof bulmaCalendar !== "undefined") {
				clearInterval(checkInterval);
				resolve(bulmaCalendar);
			}
		}, 50);

		setTimeout(() => {
			clearInterval(checkInterval);
			reject(new Error("Bulma Calendar failed to load"));
		}, 5000);
	});
};

export default function VisitCalendar({
	selectedDate,
	onDateChange,
}: VisitCalendarProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const calendarRef = useRef<BulmaCalendarInstance | null>(null);
	const initialDateRef = useRef(selectedDate);
	const onDateChangeRef = useRef(onDateChange);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		onDateChangeRef.current = onDateChange;
	}, [onDateChange]);

	useEffect(() => {
		let mounted = true;

		const initializeCalendar = async () => {
			try {
				const calendarLib = await waitForBulmaCalendar();
				if (!mounted || !containerRef.current || !calendarLib) return;

				const attachments = calendarLib.attach(containerRef.current, {
					type: "date",
					displayMode: "inline",
					color: "primary",
					dateFormat: "yyyy-MM-dd",
					startDate: initialDateRef.current,
					showFooter: false,
					showHeader: false,
					weekStart: 1,
					highlightedDates: ['2025-11-05'],
					minDate: (() => {
						const today = new Date();
						today.setHours(0, 0, 0, 0);
						return today;
					})(),
				}) as BulmaCalendarInstance[] | BulmaCalendarInstance | null;

				if (!mounted) return;

				const calendarInstance = Array.isArray(attachments) ? attachments[0] : attachments;
				if (!calendarInstance) {
					setError("Failed to initialize calendar");
					setIsLoading(false);
					return;
				}

				calendarRef.current = calendarInstance;
				calendarInstance.value(initialDateRef.current);
				calendarInstance.on("select", (datepicker) => {
					const selection = getSelectedValue(datepicker.data.value());
					if (selection) onDateChangeRef.current(selection);
				});

				setIsLoading(false);
				setError(null);
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err.message : "Failed to load calendar");
					setIsLoading(false);
				}
			}
		};

		void initializeCalendar();

		return () => {
			mounted = false;
			calendarRef.current?.destroy();
			calendarRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (calendarRef.current) {
			calendarRef.current.value(selectedDate);
		}
	}, [selectedDate]);

	return (
		<div className="visit-calendar">
			<header className="mb-4">
				<p className="title is-5">Selecteer een dag</p>
				<p className="subtitle is-6">
					De agenda wordt direct bijgewerkt wanneer je bladert.
				</p>
			</header>
			{error ? (
				<div className="notification is-warning">
					<strong>Agenda fout:</strong> {error}
				</div>
			) : (
				<div>
					{isLoading && (
						<div className="has-text-centered py-4">
							<span className="has-text-grey">Agenda laden...</span>
						</div>
					)}
					<div ref={containerRef} className="calendar-container" />
				</div>
			)}
		</div>
	);
}
