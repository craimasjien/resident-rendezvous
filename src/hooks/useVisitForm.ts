import { useEffect, useState } from "react";
import React from "react";
import { useVisits } from "./useVisits";
import type { Visit } from "@/types/visit";
import { validateVisit } from "@/utils/visitValidation";

export interface VisitFormState {
	visitorName: string;
	date: string;
	time: string;
	durationMinutes: number;
	description: string;
}

export interface VisitFormErrors {
	general: string | null;
}

/**
 * Hook for managing visit form state and validation
 */
export function useVisitForm(initialDate?: string, editingVisit?: Visit | null) {
	const { visits } = useVisits();
	const [formState, setFormState] = useState<VisitFormState>({
		visitorName: "",
		date: initialDate || "",
		time: "",
		durationMinutes: 60,
		description: "",
	});
	const [error, setError] = useState<string | React.ReactNode | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isEditing = !!editingVisit;

	// Reset form when props change
	useEffect(() => {
		if (editingVisit) {
			setFormState({
				visitorName: editingVisit.visitorName,
				date: editingVisit.date,
				time: editingVisit.time,
				durationMinutes: editingVisit.durationMinutes,
				description: editingVisit.description || "",
			});
		} else {
			setFormState({
				visitorName: "",
				date: initialDate || "",
				time: "",
				durationMinutes: 60,
				description: "",
			});
		}
		setError(null);
	}, [initialDate, editingVisit]);

	// Real-time validation
	useEffect(() => {
		if (isSubmitting) return;

		const validationError = validateVisit(
			formState.date,
			formState.time,
			formState.durationMinutes,
			visits,
			editingVisit?.id,
		);

		setError((prevError) => {
			if (validationError) {
				return validationError;
			}
			// Clear validation-related errors when validation passes
			if (prevError) {
				// Clear string errors that are validation-related
				if (
					typeof prevError === "string" &&
					(prevError.includes("overlapt") ||
						prevError.includes("maaltijd") ||
						prevError.includes("gereserveerde tijden") ||
						prevError.includes("alleen gepland worden") ||
						prevError.includes("Kies een andere tijd"))
				) {
					return null;
				}
				// Clear React element errors (like blocked timeslot errors) when validation passes
				if (React.isValidElement(prevError)) {
					return null;
				}
			}
			return prevError;
		});
	}, [
		formState.date,
		formState.time,
		formState.durationMinutes,
		visits,
		isEditing,
		editingVisit?.id,
		isSubmitting,
	]);

	const updateField = (field: keyof VisitFormState, value: string | number) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const setGeneralError = (message: string | React.ReactNode | null) => {
		setError(message);
	};

	const setSubmitting = (submitting: boolean) => {
		setIsSubmitting(submitting);
	};

	const getValidationError = (): string | null => {
		return validateVisit(
			formState.date,
			formState.time,
			formState.durationMinutes,
			visits,
			editingVisit?.id,
		);
	};

	return {
		formState,
		error,
		isSubmitting,
		isEditing,
		updateField,
		setGeneralError,
		setSubmitting,
		getValidationError,
	};
}

