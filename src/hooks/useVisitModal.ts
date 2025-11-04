import { useState } from "react";
import type { Visit } from "@/types/visit";

/**
 * Hook for managing visit modal state
 */
export function useVisitModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

	const openModal = (visit?: Visit) => {
		setEditingVisit(visit || null);
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
		setEditingVisit(null);
	};

	const editVisit = (visit: Visit) => {
		setEditingVisit(visit);
		setIsOpen(true);
	};

	return {
		isOpen,
		editingVisit,
		openModal,
		closeModal,
		editVisit,
	};
}

