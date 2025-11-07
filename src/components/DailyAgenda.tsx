import { useMemo, useEffect } from "react";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useDailyVisits } from "@/hooks/useDailyVisits";
import { useVisitActions } from "@/hooks/useVisitActions";
import { useVisitModal } from "@/hooks/useVisitModal";
import type { Visit } from "@/types/visit";
import { formatDateLong } from "@/utils/dateFormatting";
import ErrorAlert from "@/components/ui/ErrorAlert";

import BookingModal from "./BookingModal";
import VisitCard from "./VisitCard";
import EmptyVisitsState from "./visits/EmptyVisitsState";

interface DailyAgendaProps {
	selectedDate: string;
	onDateChange?: (date: string) => void;
}

export default function DailyAgenda({
	selectedDate,
	onDateChange,
}: DailyAgendaProps) {
	const { dailyVisits, isLoading, error } = useDailyVisits(selectedDate);
	const currentUserId = useCurrentUserId();
	const { isOpen, editingVisit, openModal, closeModal, editVisit } =
		useVisitModal();
	const { deleteVisit, deletingVisitId } = useVisitActions();

	// Sync selectedDate when editingVisit changes - if the visit being edited
	// is on a different date than selectedDate, update selectedDate to match
	useEffect(() => {
		if (editingVisit && editingVisit.date !== selectedDate && onDateChange) {
			onDateChange(editingVisit.date);
		}
	}, [editingVisit, selectedDate, onDateChange]);

	const formattedDate = useMemo(
		() => formatDateLong(selectedDate),
		[selectedDate],
	);

	const handleDeleteVisit = async (visit: Visit) => {
		if (
			!window.confirm(
				`Weet je zeker dat je ${visit.visitorName}'s bezoek wilt verwijderen?`,
			)
		) {
			return;
		}

		try {
			await deleteVisit(visit.id);
		} catch (error) {
			console.error("Error deleting visit", error);
			alert(
				error instanceof Error
					? `Failed to delete visit: ${error.message}`
					: "Failed to delete visit. Please try again.",
			);
		}
	};

	const handleEditVisit = (visit: Visit) => {
		editVisit(visit);
	};

	const handleVisitCreated = (date: string) => {
		// Update the selected date to show the newly created/updated visit
		// This is especially important when editing a visit and changing its date
		if (onDateChange && date) {
			onDateChange(date);
		}
	};

	return (
		<>
			<div className="daily-agenda">
				<header className="mb-5">
					<h2 className="h4 mb-3" style={{ marginBottom: "1.25rem" }}>
						Geplande bezoeken op {formattedDate}
					</h2>
					<p
						className="text-muted mb-4"
						style={{
							marginBottom: "2rem",
							lineHeight: "1.7",
							wordWrap: "break-word",
							overflowWrap: "break-word",
							paddingBottom: "0.5rem",
						}}
					>
						{isLoading
							? "Bezoeken laden..."
							: error
								? "Het laden van de bezoeken is mislukt. Probeer het later nog eens."
								: "De volgende bezoeken zijn gepland:"}
					</p>
				</header>

				{error && (
					<ErrorAlert
						message={`Het laden van de bezoeken is mislukt: ${error.message}`}
					/>
				)}

				{!isLoading &&
					!error &&
					(dailyVisits.length > 0 ? (
						<div className="agenda-list">
							{dailyVisits.map((visit) => {
								const isOwner =
									currentUserId !== null && visit.userId === currentUserId;
								return (
									<VisitCard
										key={visit.id}
										visit={visit}
										isOwner={isOwner}
										isDeleting={deletingVisitId === visit.id}
										onEdit={handleEditVisit}
										onDelete={handleDeleteVisit}
									/>
								);
							})}
						</div>
					) : (
						<EmptyVisitsState isLoading={isLoading} error={error} />
					))}

				<div className="mt-5">
					<button
						type="button"
						className="btn btn-primary w-100"
						onClick={() => openModal()}
						disabled={isLoading}
						style={{
							fontSize: "1.0625rem",
							fontWeight: "600",
							padding: "1rem 1.5rem",
							boxShadow: "var(--shadow-primary)",
						}}
					>
						Plan een bezoek
					</button>
				</div>
			</div>

			<BookingModal
				isOpen={isOpen}
				onClose={closeModal}
				initialDate={selectedDate}
				editingVisit={editingVisit}
				onVisitCreated={handleVisitCreated}
			/>
		</>
	);
}
