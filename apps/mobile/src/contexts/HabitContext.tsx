import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type ApiHabit, api } from "../api";

interface HabitContextValue {
	habits: ApiHabit[];
	loading: boolean;
	addHabit: (name: string, notes?: string) => Promise<void>;
	removeHabit: (id: string) => Promise<void>;
	refresh: () => Promise<void>;
}

const Ctx = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
	const [habits, setHabits] = useState<ApiHabit[]>([]);
	const [loading, setLoading] = useState(false);

	async function refresh() {
		setLoading(true);
		try {
			const { habits } = await api.listHabits();
			setHabits(habits);
		} finally {
			setLoading(false);
		}
	}

	async function addHabit(name: string, notes: string = "") {
		const { habit } = await api.createHabit(name, notes);
		// Optimistic-ish insert + refetch for consistency.
		habits.push(habit);
		setHabits(habits);
		refresh();
	}

	async function removeHabit(id: string) {
		await api.deleteHabit(id);
		setHabits((prev) => prev.filter((h) => h.id !== id));
	}

	useEffect(() => {
		refresh();
	}, []);

	return (
		<Ctx.Provider value={{ habits, loading, addHabit, removeHabit, refresh }}>
			{children}
		</Ctx.Provider>
	);
}

export function useHabits() {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error("useHabits must be used inside HabitProvider");
	return ctx;
}
