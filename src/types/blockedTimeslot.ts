export interface BlockedTimeslot {
	id: string;
	date: string;
	time: string;
	durationMinutes: number;
	message: string;
}

export type BlockedTimeslotWriteData = Omit<BlockedTimeslot, "id">;

export const getBlockedTimeslotsCollectionPath = () => "blocked-timeslots";

