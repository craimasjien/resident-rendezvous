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

const normalizeSelectedValue = (value: string | string[]) => {
	if (Array.isArray(value)) {
		return (
			value.find((entry) => typeof entry === "string" && entry.length > 0) ??
			null
		);
	}

	return typeof value === "string" && value.length > 0 ? value : null;
};

// Wait for bulmaCalendar to be available
const waitForBulmaCalendar = (): Promise<typeof bulmaCalendar> => {
	return new Promise((resolve, reject) => {
		if (typeof bulmaCalendar !== "undefined") {
			resolve(bulmaCalendar);
			return;
		}

		// Check if script is already in the DOM
		const script = document.querySelector(
			'script[src*="bulma-calendar"]',
		) as HTMLScriptElement;

		if (!script) {
			reject(new Error("Bulma Calendar script not found in DOM"));
			return;
		}

		// Wait for script to load
		const checkInterval = setInterval(() => {
			if (typeof bulmaCalendar !== "undefined") {
				clearInterval(checkInterval);
				resolve(bulmaCalendar);
			}
		}, 50);

		// Timeout after 5 seconds
		setTimeout(() => {
			clearInterval(checkInterval);
			reject(new Error("Bulma Calendar failed to load within timeout"));
		}, 5000);
	});
};

export default function VisitCalendar({
	selectedDate,
	onDateChange,
}: VisitCalendarProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const calendarRef = useRef<BulmaCalendarInstance | null>(null);
	const initialSelectedDateRef = useRef(selectedDate);
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

				if (!mounted || !containerRef.current || !calendarLib) {
					return;
				}

				const attachments = calendarLib.attach(containerRef.current, {
					type: "date",
					displayMode: "inline",
					color: "primary",
					dateFormat: "yyyy-MM-dd",
					startDate: initialSelectedDateRef.current,
					showFooter: false,
					headerPosition: "left",
				}) as BulmaCalendarInstance[] | BulmaCalendarInstance | null;

				if (!mounted) {
					return;
				}

				const calendarInstance = Array.isArray(attachments)
					? attachments[0]
					: (attachments ?? null);

				if (!calendarInstance) {
					setError("Failed to initialize calendar");
					setIsLoading(false);
					return;
				}

				calendarRef.current = calendarInstance;

				try {
					calendarInstance.value(initialSelectedDateRef.current);
				} catch (err) {
					console.warn("Unable to set initial calendar value", err);
				}

				calendarInstance.on("select", (datepicker) => {
					const selection = normalizeSelectedValue(datepicker.data.value());
					if (selection) {
						onDateChangeRef.current(selection);
					}
				});

				setIsLoading(false);
				setError(null);
			} catch (err) {
				if (mounted) {
					setError(
						err instanceof Error ? err.message : "Failed to load calendar",
					);
					setIsLoading(false);
				}
			}
		};

		void initializeCalendar();

		return () => {
			mounted = false;
			const calendarInstance = calendarRef.current;
			if (calendarInstance) {
				try {
					calendarInstance.destroy();
				} catch (err) {
					console.warn("Error destroying calendar", err);
				}
				calendarRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
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
			{error ? (
				<div className="notification is-warning">
					<strong>Calendar Error:</strong> {error}
				</div>
			) : (
				<div>
					{isLoading && (
						<div className="has-text-centered py-4">
							<span className="has-text-grey">Loading calendar...</span>
						</div>
					)}
					<div ref={containerRef} className="calendar-container" />
				</div>
			)}
		</div>
	);
}
