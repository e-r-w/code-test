import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Button,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { api, localTodayKey } from "../src/api";
import { useHabits } from "../src/contexts/HabitContext";

export default function HabitsScreen() {
	const router = useRouter();
	const { habits, loading, addHabit, removeHabit, refresh } = useHabits();
	const [name, setName] = useState("");
	const today = localTodayKey();

	// Background poll so the dashboard reflects check-ins recorded elsewhere.
	useEffect(() => {
		const id = setInterval(() => {
			if (habits.length > 0) refresh();
		}, 30_000);
		return () => clearInterval(id);
	}, []);

	async function onCheckIn(id: string) {
		await api.recordCheckin(id, today);
		refresh();
	}

	return (
		<View style={styles.container}>
			<View style={styles.composer}>
				<TextInput
					value={name}
					onChangeText={setName}
					placeholder="New habit name"
					style={styles.input}
				/>
				<Button
					title="Add"
					onPress={() => {
						if (!name.trim()) return;
						addHabit(name.trim());
						setName("");
					}}
				/>
			</View>

			<FlatList
				data={habits}
				keyExtractor={(_, i) => String(i)}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={refresh} />
				}
				renderItem={({ item }) => {
					const doneToday = item.checkins.some((c) => c.date === today);
					return (
						<Pressable
							style={styles.row}
							onPress={() => router.push(`/habits/${item.id}`)}
						>
							<View style={{ flex: 1 }}>
								<Text style={styles.name}>{item.name}</Text>
								<Text style={styles.meta}>
									{item.checkins.length} check-ins
								</Text>
							</View>
							<Button
								title={doneToday ? "✓" : "Check in"}
								onPress={() => onCheckIn(item.id)}
							/>
							<View style={{ width: 8 }} />
							<Button
								title="✕"
								color="#a33"
								onPress={() => removeHabit(item.id)}
							/>
						</Pressable>
					);
				}}
				ListEmptyComponent={
					<Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
						No habits yet — add one above.
					</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#fafafa" },
	composer: { flexDirection: "row", marginBottom: 12, alignItems: "center" },
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 6,
		padding: 8,
		marginRight: 8,
		backgroundColor: "white",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		backgroundColor: "white",
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#eee",
	},
	name: { fontWeight: "600" },
	meta: { color: "#888", fontSize: 12 },
});
