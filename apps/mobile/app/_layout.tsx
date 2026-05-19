import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HabitProvider } from "../src/contexts/HabitContext";

export default function RootLayout() {
	return (
		<HabitProvider>
			<Stack>
				<Stack.Screen name="index" options={{ title: "Habits" }} />
				<Stack.Screen name="habits/[id]" options={{ title: "Habit" }} />
			</Stack>
			<StatusBar style="auto" />
		</HabitProvider>
	);
}
