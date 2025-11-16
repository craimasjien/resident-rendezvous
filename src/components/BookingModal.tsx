import { useMemo, useEffect } from "react";
import React from "react";
import { addDoc, doc, updateDoc } from "firebase/firestore";
import { createPortal } from "react-dom";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useBlockedTimeslots } from "@/hooks/useBlockedTimeslots";
import { useVisitForm } from "@/hooks/useVisitForm";
import type { Visit, VisitWriteData } from "@/types/visit";
import { sanitizeText } from "@/utils/sanitize";
import { calculateDepartureTime } from "@/utils/timeUtils";
import VisitForm from "./forms/VisitForm";
import { useDailyVisits } from "@/hooks/useDailyVisits";
import { checkSameDayVisit, checkBlockedTimeslotConflict } from "@/utils/visitValidation";
import { getCurrentUser } from "@/firebaseClient";

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialDate?: string;
	editingVisit?: Visit | null;
	onVisitCreated?: (date: string) => void;
}

export default function BookingModal({
	isOpen,
	onClose,
	initialDate,
	editingVisit,
	onVisitCreated,
}: BookingModalProps) {
	const userId = useCurrentUserId();
	const { blockedTimeslots } = useBlockedTimeslots();
	const {
		formState,
		error,
		isSubmitting,
		isEditing,
		updateField,
		setGeneralError,
		setSubmitting,
		getValidationError,
	} = useVisitForm(initialDate, editingVisit);

	const { dailyVisits } = useDailyVisits(formState.date);
	const { sameDayVisits } = checkSameDayVisit(
		formState.date,
		dailyVisits,
		editingVisit?.id,
	);

	// Find blocked timeslots for the selected date
	const blockedTimeslotsForDate = blockedTimeslots.filter(
		(blocked) => blocked.date === formState.date,
	);

	const conflict = getValidationError();

	// Check for actual blocked timeslot conflicts (not just informational)
	const blockedTimeslotConflict = useMemo(() => {
		if (!formState.time || !formState.date) return null;

		const conflictingBlockedTimeslot = blockedTimeslotsForDate.find((blocked) =>
			checkBlockedTimeslotConflict(
				formState.date,
				formState.time,
				formState.durationMinutes,
				blocked,
			),
		);

		if (conflictingBlockedTimeslot) {
			const endTime = calculateDepartureTime(
				conflictingBlockedTimeslot.time,
				conflictingBlockedTimeslot.durationMinutes,
			);
			return `Je kunt geen bezoek plannen tijdens een geblokkeerde periode van (${conflictingBlockedTimeslot.time} - ${endTime}). Kies een andere tijd.`;
		}

		return null;
	}, [
		formState.date,
		formState.time,
		formState.durationMinutes,
		blockedTimeslotsForDate,
	]);

	// Check for blocked timeslot conflicts in real-time
	useEffect(() => {
		if (isSubmitting) return;

		if (blockedTimeslotConflict) {
			setGeneralError(blockedTimeslotConflict);
		} else {
			// No conflict with blocked timeslots - clear the blocked timeslot error if it exists
			// Check if error is a React element (blocked timeslot error) or a string containing "geblokkeerde periode"
			const isBlockedTimeslotError =
				error &&
				(React.isValidElement(error) ||
					(typeof error === "string" && error.includes("geblokkeerde periode")));

			if (isBlockedTimeslotError) {
				// Clear the blocked timeslot error if the conflict is resolved
				const validationError = getValidationError();
				if (!validationError) {
					setGeneralError(null);
				} else {
					// If there's another validation error, use that instead
					setGeneralError(validationError);
				}
			}
		}
	}, [
		blockedTimeslotConflict,
		isSubmitting,
		error,
		getValidationError,
		setGeneralError,
	]);

	// Combine conflict messages - only include actual conflicts (not just informational blocked timeslots)
	// Note: Blocked timeslots are already shown as informational in VisitForm.tsx
	const combinedError = useMemo(() => {
		const parts: string[] = [];

		if (conflict) {
			parts.push(conflict);
		}

		if (blockedTimeslotConflict) {
			parts.push(blockedTimeslotConflict);
		}

		return parts.length > 0 ? parts.join(" | ") : null;
	}, [conflict, blockedTimeslotConflict]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setGeneralError(null);

		if (!userId) {
			setGeneralError("Je moet ingelogd zijn om een bezoek te plannen");
			return;
		}

		// Check ownership when editing
		if (isEditing && editingVisit) {
			if (editingVisit.userId !== userId) {
				setGeneralError("Je kunt alleen je eigen bezoeken bewerken");
				return;
			}
		}

		// Check if the visit time conflicts with any blocked timeslot
		for (const blockedTimeslot of blockedTimeslotsForDate) {
			if (
				checkBlockedTimeslotConflict(
					formState.date,
					formState.time,
					formState.durationMinutes,
					blockedTimeslot,
				)
			) {
				const endTime = calculateDepartureTime(
					blockedTimeslot.time,
					blockedTimeslot.durationMinutes,
				);
				setGeneralError(
					`Dit bezoek overlapt met een geblokkeerde periode: ${blockedTimeslot.message}. De kalender is niet beschikbaar van ${blockedTimeslot.time} tot ${endTime}. Kies een andere tijd.`,
				);
				return;
			}
		}

		const conflict = getValidationError();
		if (conflict) {
			setGeneralError(conflict);
			return;
		}

		setSubmitting(true);

		try {
			// Check if user authenticated with Google
			const currentUser = getCurrentUser();
			const isGoogleAuth = currentUser && !currentUser.isAnonymous &&
				currentUser.providerData.some(provider => provider.providerId === 'google.com');

			const visitData: VisitWriteData = {
				date: formState.date,
				time: formState.time,
				visitorName: formState.visitorName.trim(),
				durationMinutes: formState.durationMinutes,
				description: formState.description.trim()
					? sanitizeText(formState.description.trim())
					: "",
				userId,
				verified: isGoogleAuth || false,
			};

			const collectionRef = getVisitsCollection();

			if (isEditing && editingVisit) {
				await updateDoc(doc(collectionRef, editingVisit.id), visitData);
				// Always call callback with the updated date to ensure UI syncs correctly
				// This is critical when the visit date changes or when editing a visit
				// that's on a different date than the currently selected date
				if (onVisitCreated) {
					onVisitCreated(formState.date);
				}
			} else {
				await addDoc(collectionRef, visitData);
				// Call callback with the date when a new visit is created
				if (onVisitCreated) {
					onVisitCreated(formState.date);
				}
			}

			onClose();
		} catch (err) {
			console.error(`Error ${isEditing ? "updating" : "creating"} visit`, err);
			setGeneralError(
				err instanceof Error
					? err.message
					: `Bezoek ${isEditing ? "bijwerken" : "aanmaken"} mislukt.`,
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	const modalContent = (
		<div
			className="modal show d-block"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
			tabIndex={-1}
			onClick={(e) =>
				e.target === e.currentTarget && !isSubmitting && onClose()
			}
			onKeyDown={(e) => {
				if (
					(e.key === "Escape" || e.key === "Enter" || e.key === " ") &&
					e.target === e.currentTarget &&
					!isSubmitting
				) {
					e.preventDefault();
					onClose();
				}
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Booking modal"
		>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header bg-primary text-white">
						<h5 className="modal-title">
							{isEditing ? "Wijzig je bezoek" : "Plan een bezoek"}
						</h5>
						<button
							type="button"
							className="btn-close btn-close-white"
							aria-label="sluiten"
							onClick={onClose}
							disabled={isSubmitting}
						/>
					</div>
					<VisitForm
						formState={formState}
						error={error}
						isSubmitting={isSubmitting}
						isEditing={isEditing}
						onChange={updateField}
						onSubmit={handleSubmit}
						onCancel={onClose}
						conflict={combinedError || conflict}
						sameDayVisits={sameDayVisits}
						blockedTimeslots={blockedTimeslotsForDate}
					/>
				</div>
			</div>
		</div>
	);

	// Render modal at document root level using portal to ensure it spans the full page
	return createPortal(modalContent, document.body);
}
