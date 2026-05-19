// Base URL for the Next.js API.
//
// iOS simulator can reach the host machine via `localhost`.
// Physical devices / Android emulator cannot.
const API_BASE = "http://localhost:3000";

// Identifies the current user to the API. Hardcoded for the demo;
// in production this would come from the auth flow.
const CURRENT_USER_ID = "u_alice";

export interface ApiHabit {
	id: string;
	userId: string;
	name: string;
	notes: string;
	createdAt: string;
	checkins: { date: string }[];
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(API_BASE + path, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"X-User-Id": CURRENT_USER_ID,
			...(init?.headers ?? {}),
		},
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}

export const api = {
	listHabits(): Promise<{ habits: ApiHabit[] }> {
		return http("/api/habits");
	},
	createHabit(
		name: string,
		notes: string = "",
	): Promise<{ habit: ApiHabit }> {
		return http("/api/habits", {
			method: "POST",
			body: JSON.stringify({ name, notes }),
		});
	},
	deleteHabit(id: string): Promise<{ ok: true }> {
		return http(`/api/habits/${id}`, { method: "DELETE" });
	},
	recordCheckin(id: string, date: string): Promise<{ habit: ApiHabit }> {
		return http(`/api/habits/${id}/checkins`, {
			method: "POST",
			body: JSON.stringify({ date }),
		});
	},
	getHabit(id: string): Promise<{ habit: ApiHabit }> {
		return http(`/api/habits/${id}`);
	},
	updateHabit(
		id: string,
		patch: Partial<Pick<ApiHabit, "name" | "notes">>,
	): Promise<{ habit: ApiHabit }> {
		return http(`/api/habits/${id}`, {
			method: "PATCH",
			body: JSON.stringify(patch),
		});
	},
};

export function localTodayKey(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}
