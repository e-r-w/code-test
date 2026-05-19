export interface Habit {
	id: string;
	userId: string;
	name: string;
	/** Free-form markdown-ish notes. Supports **bold** and _italic_. */
	notes: string;
	createdAt: string;
	checkins: Checkin[];
}

export interface Checkin {
	/** ISO date in the user's local timezone, e.g. "2025-01-31". */
	date: string;
}

export interface CreateHabitRequest {
	name: string;
	notes?: string;
}

export interface RecordCheckinRequest {
	date: string;
}
