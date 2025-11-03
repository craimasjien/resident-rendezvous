import { addDoc, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useVisits } from "@/hooks/useVisits";
import type { Visit, VisitWriteData } from "@/types/visit";
import { sanitizeText } from "@/utils/sanitize";

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
	const { visits } = useVisits();
	const [visitorName, setVisitorName] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [durationMinutes, setDurationMinutes] = useState(60);
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditing = !!editingVisit;

	// Reset form when modal opens
	useEffect(() => {
		if (!isOpen) return;

		if (editingVisit) {
			setVisitorName(editingVisit.visitorName);
			setDate(editingVisit.date);
			setTime(editingVisit.time);
			setDurationMinutes(editingVisit.durationMinutes);
			setDescription(editingVisit.description || "");
		} else {
			setVisitorName("");
			setDate(initialDate || "");
			setTime("");
			setDurationMinutes(60);
			setDescription("");
		}
		setError(null);
	}, [isOpen, initialDate, editingVisit]);

	const parseTime = (t: string) => {
		const [h, m] = t.split(":").map(Number);
		return h * 60 + m;
	};

	const checkRestrictedTimeOverlap = (): string | null => {
		if (!time || !durationMinutes) return null;

		const start = parseTime(time);
		const end = start + durationMinutes;

		// Restricted periods: 12:00-13:00 (720-780 minutes) and 17:00-18:00 (1020-1080 minutes)
		const lunchStart = 12 * 60; // 720 minutes
		const lunchEnd = 13 * 60; // 780 minutes
		const dinnerStart = 17 * 60; // 1020 minutes
		const dinnerEnd = 18 * 60; // 1080 minutes

		const overlapsLunch = start < lunchEnd && end > lunchStart;
		const overlapsDinner = start < dinnerEnd && end > dinnerStart;

		if (overlapsLunch || overlapsDinner) {
			const periods = [];
			if (overlapsLunch) periods.push("12:00-13:00");
			if (overlapsDinner) periods.push("17:00-18:00");
			return `Bezoeken kunnen niet overlappen met de maaltijd van ${periods.join(" en ")}. Kies een andere tijd.`;
		}

		return null;
	};

	const checkConflict = (): string | null => {
		if (!date || !time || !durationMinutes) return null;

		// First check restricted time periods
		const restrictedError = checkRestrictedTimeOverlap();
		if (restrictedError) return restrictedError;

		const conflictingVisits = visits.filter((visit) => {
			if (isEditing && visit.id === editingVisit?.id) return false;
			if (visit.date !== date) return false;

			const start1 = parseTime(time);
			const end1 = start1 + durationMinutes;
			const start2 = parseTime(visit.time);
			const end2 = start2 + visit.durationMinutes;

			return start1 < end2 && start2 < end1;
		});

		if (conflictingVisits.length > 0) {
			const names = conflictingVisits.map((v) => v.visitorName).join(", ");
			return `Dit bezoek overlapt met een bestaand bezoek van ${names}. Kies een andere tijd of datum om conflicten te vermijden.`;
		}

		return null;
	};

	// Show conflict error in real-time
	useEffect(() => {
		if (isSubmitting) return;
		const conflict = checkConflict();
		setError((prevError) => {
			if (conflict) {
				return conflict;
			}
			// Clear conflict and restricted time errors but preserve other errors
			if (prevError && (prevError.includes("overlapt") || prevError.includes("maaltijd") || prevError.includes("gereserveerde tijden"))) {
				return null;
			}
			return prevError;
		});
	}, [date, time, durationMinutes, visits, isEditing, editingVisit?.id, isSubmitting]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!userId) {
			setError("Je moet ingelogd zijn om een bezoek te plannen");
			return;
		}

		const conflict = checkConflict();
		if (conflict) {
			setError(conflict);
			return;
		}

		setIsSubmitting(true);

		try {
			const visitData: VisitWriteData = {
				date,
				time,
				visitorName: visitorName.trim(),
				durationMinutes,
				description: description.trim() ? sanitizeText(description.trim()) : "",
				userId,
			};

			const collectionRef = getVisitsCollection();

			if (isEditing && editingVisit) {
				await updateDoc(doc(collectionRef, editingVisit.id), visitData);
			} else {
				await addDoc(collectionRef, visitData);
				// Call callback with the date when a new visit is created
				if (onVisitCreated) {
					onVisitCreated(date);
				}
			}

			onClose();
		} catch (err) {
			console.error(`Error ${isEditing ? "updating" : "creating"} visit`, err);
			setError(
				err instanceof Error
					? err.message
					: `Bezoek ${isEditing ? "bijwerken" : "aanmaken"} mislukt.`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	const conflict = checkConflict();

	const modalContent = (
		<div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
			<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
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
					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							<div className="alert alert-info mb-4" role="alert">
								<strong>Let op:</strong> Bezoeken kunnen niet overlappen met de maaltijden van <b>12:00-13:00</b> en <b>17:00-18:00</b>.
							</div>

							{error && (
								<div className="alert alert-danger mb-4" role="alert">
									{error}
								</div>
							)}

							<div className="mb-3">
								<label htmlFor="visitor-name" className="form-label">
									Bezoekersnaam <span className="text-danger">*</span>
								</label>
								<input
									id="visitor-name"
									className="form-control"
									type="text"
									placeholder="Voer je naam in"
									value={visitorName}
									onChange={(e) => setVisitorName(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>

							<div className="mb-3">
								<label htmlFor="visit-date" className="form-label">
									Datum <span className="text-danger">*</span>
								</label>
								<input
									id="visit-date"
									className="form-control"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>

							<div className="mb-3">
								<label htmlFor="visit-time" className="form-label">
									Tijd <span className="text-danger">*</span>
								</label>
								<input
									id="visit-time"
									className="form-control"
									type="time"
									value={time}
									onChange={(e) => setTime(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>

							<div className="mb-3">
								<label htmlFor="duration" className="form-label">
									Duur (minuten) <span className="text-danger">*</span>
								</label>
								<input
									id="duration"
									className="form-control"
									type="number"
									value={durationMinutes}
									onChange={(e) =>
										setDurationMinutes(Number.parseInt(e.target.value, 10))
									}
									disabled={isSubmitting}
									required
								/>
							</div>

							<div className="mb-3">
								<label htmlFor="description" className="form-label">
									Beschrijving (optioneel)
								</label>
								<textarea
									id="description"
									className="form-control"
									placeholder="Voeg notities toe over dit bezoek..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									disabled={isSubmitting}
									rows={3}
								/>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="submit"
								className={`btn btn-primary ${isSubmitting ? "disabled" : ""}`}
								disabled={isSubmitting || conflict !== null}
							>
								{isSubmitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
								{isEditing ? "Bezoek bijwerken" : "Bezoek inplannen"}
							</button>
							<button
								type="button"
								className="btn btn-secondary"
								onClick={onClose}
								disabled={isSubmitting}
							>
								Annuleren
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);

	// Render modal at document root level using portal to ensure it spans the full page
	return createPortal(modalContent, document.body);
}
