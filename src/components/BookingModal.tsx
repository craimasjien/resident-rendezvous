import { addDoc, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";

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
}

interface FormErrors {
	visitorName?: string;
	date?: string;
	time?: string;
	durationMinutes?: string;
}

const validateTime = (time: string): boolean => {
	// HH:mm format validation
	const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
	return timeRegex.test(time);
};

const validateDate = (date: string): boolean => {
	// yyyy-MM-dd format validation
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(date)) {
		return false;
	}

	const parsedDate = new Date(`${date}T00:00:00`);
	return !Number.isNaN(parsedDate.getTime());
};

export default function BookingModal({
	isOpen,
	onClose,
	initialDate,
	editingVisit,
}: BookingModalProps) {
	const userId = useCurrentUserId();
	const { visits } = useVisits();
	const [visitorName, setVisitorName] = useState("");
	const [date, setDate] = useState(initialDate || "");
	const [time, setTime] = useState("");
	const [durationMinutes, setDurationMinutes] = useState(60);
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [conflictError, setConflictError] = useState<string | null>(null);
	const isSubmittingRef = useRef(false);

	const isEditing = editingVisit !== null && editingVisit !== undefined;

	const checkTimeOverlap = useCallback(
		(
			start1: string,
			duration1: number,
			start2: string,
			duration2: number,
		): boolean => {
			const parseTime = (timeStr: string): number => {
				const [hours, minutes] = timeStr.split(":").map(Number);
				return hours * 60 + minutes;
			};

			const startMinutes1 = parseTime(start1);
			const endMinutes1 = startMinutes1 + duration1;
			const startMinutes2 = parseTime(start2);
			const endMinutes2 = startMinutes2 + duration2;

			// Check if time ranges overlap
			return startMinutes1 < endMinutes2 && startMinutes2 < endMinutes1;
		},
		[],
	);

	const detectConflicts = useCallback((): string | null => {
		if (!date || !time || !durationMinutes) {
			return null;
		}

		const conflictingVisits = visits.filter((visit) => {
			// Skip the visit being edited if we're in edit mode
			if (isEditing && visit.id === editingVisit?.id) {
				return false;
			}

			// Check if on the same date
			const visitDateISO = new Date(`${visit.date}T00:00:00`)
				.toISOString()
				.slice(0, 10);
			const newDateISO = new Date(`${date}T00:00:00`)
				.toISOString()
				.slice(0, 10);

			if (visitDateISO !== newDateISO) {
				return false;
			}

			// Check for time overlap
			return checkTimeOverlap(
				time,
				durationMinutes,
				visit.time,
				visit.durationMinutes,
			);
		});

		if (conflictingVisits.length > 0) {
			const names = conflictingVisits.map((v) => v.visitorName).join(", ");
			return `Dit bezoek overlapt met bestaande bezoeken van ${names}.`;
		}

		return null;
	}, [
		date,
		time,
		durationMinutes,
		visits,
		isEditing,
		editingVisit?.id,
		checkTimeOverlap,
	]);

	// Reset form when modal opens/closes, initialDate changes, or editingVisit changes
	useEffect(() => {
		if (isOpen) {
			if (editingVisit) {
				// Pre-fill form for editing
				setVisitorName(editingVisit.visitorName);
				setDate(editingVisit.date);
				setTime(editingVisit.time);
				setDurationMinutes(editingVisit.durationMinutes);
				setDescription(editingVisit.description || "");
			} else {
				// Reset form for new visit
				setVisitorName("");
				setDate(initialDate || "");
				setTime("");
				setDurationMinutes(60);
				setDescription("");
			}
			setErrors({});
			setSubmitError(null);
			setConflictError(null);
			isSubmittingRef.current = false;
		}
	}, [isOpen, initialDate, editingVisit]);

	// Check for conflicts when date, time, or duration changes
	// Skip updating conflict error during submission to prevent flash
	useEffect(() => {
		if (isSubmitting || isSubmittingRef.current) {
			return;
		}
		if (isOpen && date && time && durationMinutes) {
			const conflict = detectConflicts();
			setConflictError(conflict);
		} else {
			setConflictError(null);
		}
	}, [isOpen, date, time, durationMinutes, detectConflicts, isSubmitting]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!visitorName.trim()) {
			newErrors.visitorName = "Bezoekersnaam is verplicht";
		}

		if (!date) {
			newErrors.date = "Datum is verplicht";
		} else if (!validateDate(date)) {
			newErrors.date = "Voer een geldige datum in (jjjj-MM-dd)";
		}

		if (!time) {
			newErrors.time = "Tijd is verplicht";
		} else if (!validateTime(time)) {
			newErrors.time = "Voer een geldige tijd in (UU:mm)";
		}

		if (!durationMinutes || durationMinutes < 15) {
			newErrors.durationMinutes = "Duur moet minimaal 15 minuten zijn";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (!validateForm()) {
			return;
		}

		if (!userId) {
			setSubmitError("Je moet ingelogd zijn om een bezoek te plannen");
			return;
		}

		// Check for conflicts - prevent submission if conflict exists
		const conflict = detectConflicts();
		if (conflict) {
			setConflictError(conflict);
			return;
		}

		// Set ref first to prevent useEffect from running, then clear error
		isSubmittingRef.current = true;
		setConflictError(null);
		setIsSubmitting(true);

		try {
			// Convert to canonical Visit format
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
				// Update existing visit
				const visitDocRef = doc(collectionRef, editingVisit.id);
				await updateDoc(visitDocRef, visitData);
			} else {
				// Create new visit
				await addDoc(collectionRef, visitData);
			}

			// Success - close modal and reset form
			// The Firestore listener will automatically refresh the visits list
			onClose();
		} catch (error) {
			console.error(
				`Error ${isEditing ? "updating" : "creating"} visit`,
				error,
			);
			setSubmitError(
				error instanceof Error
					? error.message
					: `Bezoek ${isEditing ? "bijwerken" : "aanmaken"} mislukt. Probeer het opnieuw.`,
			);
		} finally {
			setIsSubmitting(false);
			isSubmittingRef.current = false;
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			onClose();
		}
	};

	if (!isOpen) {
		return null;
	}

	const handleBackgroundClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	const handleBackgroundKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			handleClose();
		}
	};

	return (
		<div className="modal is-active">
			<div
				className="modal-background"
				onClick={handleBackgroundClick}
				onKeyDown={handleBackgroundKeyDown}
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
						onClick={handleClose}
						disabled={isSubmitting}
					/>
				</header>
				<form onSubmit={handleSubmit}>
					<section className="modal-card-body">
						{submitError && (
							<div className="notification is-danger mb-4" role="alert">
								{submitError}
							</div>
						)}

						{conflictError && (
							<div className="notification is-danger mb-4" role="alert">
								<strong>Conflict gedetecteerd:</strong> {conflictError}
								<br />
								<span className="is-size-7">
									Kies een andere tijd of datum om conflicten te vermijden.
								</span>
							</div>
						)}

						<div className="field">
							<label htmlFor="visitor-name" className="label">
								Bezoekersnaam <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visitor-name"
									className={`input ${errors.visitorName ? "is-danger" : ""}`}
									type="text"
									placeholder="Voer je naam in"
									value={visitorName}
									onChange={(e) => setVisitorName(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
							{errors.visitorName && (
								<p className="help is-danger">{errors.visitorName}</p>
							)}
						</div>

						<div className="field">
							<label htmlFor="visit-date" className="label">
								Datum <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visit-date"
									className={`input ${errors.date ? "is-danger" : ""}`}
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
							{errors.date && <p className="help is-danger">{errors.date}</p>}
						</div>

						<div className="field">
							<label htmlFor="visit-time" className="label">
								Tijd <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visit-time"
									className={`input ${errors.time ? "is-danger" : ""}`}
									type="time"
									value={time}
									onChange={(e) => setTime(e.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
							{errors.time && <p className="help is-danger">{errors.time}</p>}
						</div>

						<div className="field">
							<label htmlFor="duration" className="label">
								Duur (minuten) <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="duration"
									className={`input ${errors.durationMinutes ? "is-danger" : ""}`}
									type="number"
									min="15"
									step="15"
									value={durationMinutes}
									onChange={(e) =>
										setDurationMinutes(Number.parseInt(e.target.value, 10) || 0)
									}
									disabled={isSubmitting}
									required
								/>
							</div>
							{errors.durationMinutes && (
								<p className="help is-danger">{errors.durationMinutes}</p>
							)}
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
							disabled={isSubmitting || conflictError !== null}
							title={
								conflictError
									? "Los het conflict op voordat je het bezoek aanmaakt"
									: undefined
							}
						>
							{isEditing ? "Bezoek bijwerken" : "Bezoek inplannen"}
						</button>
						<button
							type="button"
							className="button"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Annuleren
						</button>
					</footer>
				</form>
			</div>
		</div>
	);
}
