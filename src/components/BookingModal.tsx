import { addDoc, doc, updateDoc } from "firebase/firestore";
import { createPortal } from "react-dom";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useVisitForm } from "@/hooks/useVisitForm";
import type { Visit, VisitWriteData } from "@/types/visit";
import { sanitizeText } from "@/utils/sanitize";
import VisitForm from "./forms/VisitForm";
import { useDailyVisits } from "@/hooks/useDailyVisits";
import { checkSameDayVisit } from "@/utils/visitValidation";
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setGeneralError(null);

		if (!userId) {
			setGeneralError("Je moet ingelogd zijn om een bezoek te plannen");
			return;
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
				// Call callback with the date when a visit is updated (especially if date changed)
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

	const conflict = getValidationError();

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
						conflict={conflict}
						sameDayVisits={sameDayVisits}
					/>
				</div>
			</div>
		</div>
	);

	// Render modal at document root level using portal to ensure it spans the full page
	return createPortal(modalContent, document.body);
}
