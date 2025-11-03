import { addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { getVisitsCollection } from "@/firebase/visitsCollection";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import type { VisitWriteData } from "@/types/visit";

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialDate?: string;
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
}: BookingModalProps) {
	const userId = useCurrentUserId();
	const [visitorName, setVisitorName] = useState("");
	const [date, setDate] = useState(initialDate || "");
	const [time, setTime] = useState("");
	const [durationMinutes, setDurationMinutes] = useState(60);
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Reset form when modal opens/closes or initialDate changes
	useEffect(() => {
		if (isOpen) {
			setVisitorName("");
			setDate(initialDate || "");
			setTime("");
			setDurationMinutes(60);
			setDescription("");
			setErrors({});
			setSubmitError(null);
		}
	}, [isOpen, initialDate]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!visitorName.trim()) {
			newErrors.visitorName = "Visitor name is required";
		}

		if (!date) {
			newErrors.date = "Date is required";
		} else if (!validateDate(date)) {
			newErrors.date = "Please enter a valid date (yyyy-MM-dd)";
		}

		if (!time) {
			newErrors.time = "Time is required";
		} else if (!validateTime(time)) {
			newErrors.time = "Please enter a valid time (HH:mm)";
		}

		if (!durationMinutes || durationMinutes < 15) {
			newErrors.durationMinutes = "Duration must be at least 15 minutes";
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
			setSubmitError("You must be signed in to book a visit");
			return;
		}

		setIsSubmitting(true);

		try {
			// Convert to canonical Visit format
			const visitData: VisitWriteData = {
				date,
				time,
				visitorName: visitorName.trim(),
				durationMinutes,
				description: description.trim() || "",
				userId,
			};

			const collectionRef = getVisitsCollection();
			await addDoc(collectionRef, visitData);

			// Success - close modal and reset form
			// The Firestore listener will automatically refresh the visits list
			onClose();
		} catch (error) {
			console.error("Error creating visit", error);
			setSubmitError(
				error instanceof Error
					? error.message
					: "Failed to create visit. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
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

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={handleClose} />
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Schedule a Visit</p>
					<button
						type="button"
						className="delete"
						aria-label="close"
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

						<div className="field">
							<label htmlFor="visitor-name" className="label">
								Visitor Name <span className="has-text-danger">*</span>
							</label>
							<div className="control">
								<input
									id="visitor-name"
									className={`input ${errors.visitorName ? "is-danger" : ""}`}
									type="text"
									placeholder="Enter your name"
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
								Date <span className="has-text-danger">*</span>
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
								Time <span className="has-text-danger">*</span>
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
								Duration (minutes) <span className="has-text-danger">*</span>
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
								Description (optional)
							</label>
							<div className="control">
								<textarea
									id="description"
									className="textarea"
									placeholder="Add any notes about this visit..."
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
							disabled={isSubmitting}
						>
							Schedule Visit
						</button>
						<button
							type="button"
							className="button"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
						</button>
					</footer>
				</form>
			</div>
		</div>
	);
}
