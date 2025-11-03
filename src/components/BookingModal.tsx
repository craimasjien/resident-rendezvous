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
		<div className="modal is-active">
			<div
				className="modal-background"
				onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
				onKeyDown={(e) => e.key === "Escape" && !isSubmitting && onClose()}
				role="button"
				tabIndex={-1}
				aria-label="Sluit modal"
			/>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">
						{isEditing ? "Wijzig je bezoek" : "Plan een bezoek"}
					</p>
					<button
						type="button"
						className="delete"
						aria-label="sluiten"
						onClick={onClose}
						disabled={isSubmitting}
					/>
				</header>
				<form onSubmit={handleSubmit}>
					<section className="modal-card-body">
						<div className="notification is-info mb-4" role="alert">
							<strong>Let op:</strong> Bezoeken kunnen niet overlappen met de maaltijden van <b>12:00-13:00</b> en <b>17:00-18:00</b>.
						</div>

						{error && (
							<div className="notification is-danger mb-4" role="alert">
								{error}
							</div>
						)}

						<div className="field">
							<label htmlFor="visitor-name" className="label">
								Bezoekersnaam <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visitor-name"
									className="input"
									type="text"
									placeholder="Voer je naam in"
									value={visitorName}
									onChange={(e) => setVisitorName(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
						</div>

						<div className="field">
							<label htmlFor="visit-date" className="label">
								Datum <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visit-date"
									className="input"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
						</div>

						<div className="field">
							<label htmlFor="visit-time" className="label">
								Tijd <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visit-time"
									className="input"
									type="time"
									value={time}
									onChange={(e) => setTime(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
						</div>

						<div className="field">
							<label htmlFor="duration" className="label">
								Duur (minuten) <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="duration"
									className="input"
									type="number"
									value={durationMinutes}
									onChange={(e) =>
										setDurationMinutes(Number.parseInt(e.target.value, 10))
									}
									disabled={isSubmitting}
									required
								/>
							</div>
						</div>

						<div className="field">
							<label htmlFor="description" className="label">
								Beschrijving (optioneel)
							</label>
							<div className="control">
								<textarea
									id="description"
									className="textarea"
									placeholder="Voeg notities toe over dit bezoek..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									disabled={isSubmitting}
									rows={3}
								/>
							</div>
						</div>
					</section>
					<footer className="modal-card-foot">
						<button
							type="submit"
							className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
							disabled={isSubmitting || conflict !== null}
						>
							{isEditing ? "Bezoek bijwerken" : "Bezoek inplannen"}
						</button>
						<button
							type="button"
							className="button"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Annuleren
						</button>
					</footer>
				</form>
			</div>
		</div>
	);

	// Render modal at document root level using portal to ensure it spans the full page
	return createPortal(modalContent, document.body);
}
