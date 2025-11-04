import { useId } from "react";
import type { VisitFormState } from "@/hooks/useVisitForm";
import type { Visit } from "@/types/visit";

interface VisitFormProps {
	formState: VisitFormState;
	error: string | null;
	isSubmitting: boolean;
	isEditing: boolean;
	onChange: (field: keyof VisitFormState, value: string | number) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	conflict: string | null;
	sameDayVisits: Visit[] | null;
}

export default function VisitForm({
	formState,
	error,
	isSubmitting,
	isEditing,
	sameDayVisits,
	onChange,
	onSubmit,
	onCancel,
	conflict,
}: VisitFormProps) {
	const baseId = useId();
	const visitorNameId = `${baseId}-visitor-name`;
	const visitDateId = `${baseId}-visit-date`;
	const visitTimeId = `${baseId}-visit-time`;
	const durationId = `${baseId}-duration`;
	const descriptionId = `${baseId}-description`;

	return (
		<form onSubmit={onSubmit}>
			<div className="modal-body">
				<div className="alert alert-info mb-4" role="alert">
					<strong>Let op:</strong> Bezoeken kunnen niet gepland worden tijdens
					maaltijden (<b>12:00-13:00</b> en <b>17:00-18:00</b>) en rusttijd (
					<b>13:00-15:00</b>).
				</div>

				{sameDayVisits && sameDayVisits.length > 0 && (
				<div className="alert alert-warning mb-4" role="alert">
					<strong>Let op:</strong> Er is al een bezoek gepland op deze dag. Overweeg of dit niet te veel is en kies bij voorkeur een andere dag.
				</div>
				)}

				{error && (
					<div className="alert alert-danger mb-4" role="alert">
						{error}
					</div>
				)}

				<div className="mb-3">
					<label htmlFor={visitorNameId} className="form-label">
						Bezoekersnaam <span className="text-danger">*</span>
					</label>
					<input
						id={visitorNameId}
						className="form-control"
						type="text"
						placeholder="Voer je naam in"
						value={formState.visitorName}
						onChange={(e) => onChange("visitorName", e.target.value)}
						disabled={isSubmitting}
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor={visitDateId} className="form-label">
						Datum <span className="text-danger">*</span>
					</label>
					<input
						id={visitDateId}
						className="form-control"
						type="date"
						value={formState.date}
						onChange={(e) => onChange("date", e.target.value)}
						disabled={isSubmitting}
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor={visitTimeId} className="form-label">
						Tijd <span className="text-danger">*</span>
					</label>
					<input
						id={visitTimeId}
						className="form-control"
						type="time"
						value={formState.time}
						onChange={(e) => onChange("time", e.target.value)}
						disabled={isSubmitting}
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor={durationId} className="form-label">
						Duur (minuten) <span className="text-danger">*</span>
					</label>
					<input
						id={durationId}
						className="form-control"
						type="number"
						value={formState.durationMinutes}
						onChange={(e) =>
							onChange("durationMinutes", Number.parseInt(e.target.value, 10))
						}
						disabled={isSubmitting}
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor={descriptionId} className="form-label">
						Beschrijving (optioneel)
					</label>
					<textarea
						id={descriptionId}
						className="form-control"
						placeholder="Voeg notities toe over dit bezoek..."
						value={formState.description}
						onChange={(e) => onChange("description", e.target.value)}
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
					{isSubmitting && (
						<span
							className="spinner-border spinner-border-sm me-2"
							role="status"
							aria-hidden="true"
						></span>
					)}
					{isEditing ? "Bezoek bijwerken" : "Bezoek inplannen"}
				</button>
				<button
					type="button"
					className="btn btn-secondary"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Annuleren
				</button>
			</div>
		</form>
	);
}
