import type { StoredHabit } from "./db";

/**
 * Returns the user's current streak (consecutive days, ending today,
 * for which the habit has a check-in).
 */
export function computeStreak(habit: StoredHabit): number {
	const dates = new Set(habit.checkins.map((c) => c.date));

	// Start at today (UTC). Walk backwards while the day is checked.
	let streak = 1;
	const cursor = new Date();
	cursor.setUTCHours(0, 0, 0, 0);

	while (dates.has(cursor.toISOString().slice(0, 10))) {
		streak += 1;
		cursor.setUTCDate(cursor.getUTCDate() - 1);
	}

	return streak;
}

export function todayKey(): string {
	return new Date().toISOString().slice(0, 10);
}
