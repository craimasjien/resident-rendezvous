import { useEffect, useRef, useState, useMemo } from "react";
import { useVisits } from "@/hooks/useVisits";

declare global {
    const bulmaCalendar: {
        attach: (element: HTMLElement, options: any) => any;
    };
}

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
    const onDateChangeRef = useRef(onDateChange);
    const hasInitializedRef = useRef(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { visits, isLoading: visitsLoading } = useVisits();

    // Memoize processed visit dates
    const visitDates = useMemo(
        () => Array.from(new Set(visits.map((visit) => visit.date))),
        [visits]
    );

    // Keep callback ref updated
    useEffect(() => {
        onDateChangeRef.current = onDateChange;
    }, [onDateChange]);

    // Initialize calendar once when visits are loaded
    useEffect(() => {
        // Wait until visits are loaded and haven't initialized yet
        if (visitsLoading || hasInitializedRef.current) {
            return;
        }

        let mounted = true;

        const initializeCalendar = async () => {
            try {
                setIsInitializing(true);
                
                const calendarLib = await waitForBulmaCalendar();
                if (!mounted || !containerRef.current || !calendarLib) return;

                const attachments = calendarLib.attach(containerRef.current, {
                    type: "date",
                    displayMode: "inline",
                    color: "primary",
                    dateFormat: "yyyy-MM-dd",
                    startDate: selectedDate,
                    showFooter: false,
                    showHeader: false,
                    weekStart: 1,
                    highlightedDates: visitDates,
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
                    setIsInitializing(false);
                    return;
                }

                calendarRef.current = calendarInstance;
                calendarInstance.on("select", (datepicker) => {
                    const selection = getSelectedValue(datepicker.data.value());
                    if (selection) onDateChangeRef.current(selection);
                });

                hasInitializedRef.current = true;
                setIsInitializing(false);
                setError(null);
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Failed to load calendar");
                    setIsInitializing(false);
                }
            }
        };

        void initializeCalendar();

        return () => {
            mounted = false;
            // Only cleanup if we haven't successfully initialized yet
            // (on unmount, the component will be destroyed anyway)
            if (!hasInitializedRef.current && calendarRef.current) {
                calendarRef.current.destroy();
                calendarRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visitsLoading]); // Only initialize once when visits are loaded; visitDates and selectedDate captured at init time

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (calendarRef.current) {
                calendarRef.current.destroy();
                calendarRef.current = null;
            }
        };
    }, []);

    // Sync external date changes (only after initialization)
    useEffect(() => {
        if (calendarRef.current && !isInitializing) {
            calendarRef.current.value(selectedDate);
        }
    }, [selectedDate, isInitializing]);

    return (
        <div className="visit-calendar">
            <header className="mb-5" style={{ marginBottom: '2.5rem' }}>
                <h2 className="title is-5" style={{ marginBottom: '1rem' }}>Selecteer een dag</h2>
                <p className="subtitle is-6" style={{ 
                    color: 'var(--gray-600)',
                    marginBottom: '0',
                    lineHeight: '1.7',
                    minHeight: '3rem',
                    paddingBottom: '0.5rem'
                }}>
                    De agenda wordt direct bijgewerkt wanneer je bladert.
                </p>
            </header>
            {error ? (
                <div className="notification is-warning mb-4">
                    <strong>Agenda fout:</strong> {error}
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    {(visitsLoading || isInitializing) && (
                        <div className="has-text-centered py-4">
                            <span className="has-text-grey">Agenda laden...</span>
                        </div>
                    )}
                    <div ref={containerRef} className="calendar-container" style={{ marginTop: '1rem' }} />
                </div>
            )}
        </div>
    );
}
