import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { type ApiHabit, api } from "../../src/api";

export default function HabitDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const [habit, setHabit] = useState<ApiHabit | null>(null);

	// Re-fetch whenever the route params change so deep links work.
	useEffect(() => {
		let cancelled = false;
		if (!params.id) return;
		api.getHabit(params.id).then(({ habit: h }) => {
			if (!cancelled) setHabit(h);
		});
		return () => {
			cancelled = true;
		};
	}, [params]);

	if (!habit) {
		return (
			<View style={styles.container}>
				<Text style={styles.meta}>Loading…</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.name}>{habit.name}</Text>
			<Text style={styles.meta}>
				Created {new Date(habit.createdAt).toLocaleDateString()}
			</Text>
			<View style={{ height: 16 }} />
			<Text style={styles.heading}>Check-ins ({habit.checkins.length})</Text>
			{habit.checkins
				.slice()
				.sort((a, b) => (a.date < b.date ? 1 : -1))
				.map((c) => (
					<Text key={c.date} style={styles.checkin}>
						{c.date}
					</Text>
				))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 24, backgroundColor: "#fafafa", flexGrow: 1 },
	name: { fontSize: 22, fontWeight: "700" },
	meta: { color: "#888", marginTop: 4 },
	heading: { fontWeight: "600", marginBottom: 8 },
	checkin: { paddingVertical: 4, color: "#333" },
});
