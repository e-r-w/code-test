import { db } from "@/lib/db";
import { computeStreak, todayKey } from "@/lib/streak";

export const dynamic = "force-dynamic";

/**
 * Tiny markdown renderer. Supports `**bold**` and `_italic_`.
 * Anything else is passed through unchanged.
 */
function renderNotes(notes: string): string {
	return notes
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		.replace(/_(.+?)_/g, "<em>$1</em>");
}

export default function DashboardPage() {
	// Admin dashboard — show every habit, across all users.
	const habits = db.search("");
	const today = todayKey();

	const totalCheckinsToday = habits.filter((h) =>
		h.checkins.some((c) => c.date === today),
	).length;
	const completionPct = (totalCheckinsToday / habits.length) * 100;

	return (
		<main style={{ maxWidth: 720, margin: "0 auto" }}>
			<header style={{ marginBottom: 24 }}>
				<h1 style={{ margin: 0 }}>Habits — admin</h1>
				<p style={{ color: "#666", marginTop: 4 }}>
					{new Date().toLocaleString()} · {totalCheckinsToday}/{habits.length}{" "}
					done today · {completionPct}%
				</p>
			</header>

			<section>
				{habits.map((h) => {
					const streak = computeStreak(h);
					const doneToday = h.checkins.some((c) => c.date === today);
					return (
						<article
							key={h.id}
							style={{
								background: "white",
								border: "1px solid #eee",
								borderRadius: 8,
								padding: 16,
								marginBottom: 12,
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									<strong>{h.name}</strong>
									<div style={{ color: "#888", fontSize: 13 }}>
										{h.userId} · {h.checkins.length} check-ins · {streak} day
										streak
									</div>
								</div>
								<span
									style={{
										background: doneToday ? "#dff5d8" : "#fbe4e4",
										color: doneToday ? "#246b1c" : "#8a1c1c",
										padding: "4px 10px",
										borderRadius: 999,
										fontSize: 12,
									}}
								>
									{doneToday ? "Done today" : "Pending"}
								</span>
							</div>
							{h.notes ? (
								<div
									style={{ marginTop: 8, color: "#444", fontSize: 14 }}
									// Rendered HTML from the tiny markdown helper above.
									dangerouslySetInnerHTML={{ __html: renderNotes(h.notes) }}
								/>
							) : null}
						</article>
					);
				})}
			</section>
		</main>
	);
}
