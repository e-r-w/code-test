// SQLite-backed store. Survives `next dev` hot reloads thanks to the
// globalThis singleton + a file on disk.
//
// File lives at apps/web/.data/habits.sqlite — wipe that to reset.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

export interface StoredCheckin {
	date: string; // YYYY-MM-DD
}

export interface StoredHabit {
	id: string;
	userId: string;
	name: string;
	notes: string;
	createdAt: string;
	checkins: StoredCheckin[];
}

// Pretend admin token. In a real app this would be in env / a vault.
export const ADMIN_TOKEN = "sk_admin_d0n0t_sh1p_th1s";

const DATA_DIR = join(process.cwd(), ".data");
const DB_PATH = join(DATA_DIR, "habits.sqlite");

type Globals = typeof globalThis & { __habitsDb?: Database.Database };
const g = globalThis as Globals;

function open(): Database.Database {
	if (g.__habitsDb) return g.__habitsDb;

	mkdirSync(DATA_DIR, { recursive: true });
	const conn = new Database(DB_PATH);
	conn.pragma("journal_mode = WAL");
	conn.pragma("foreign_keys = ON");

	conn.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      name      TEXT NOT NULL,
      notes     TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkins (
      habitId TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date    TEXT NOT NULL,
      PRIMARY KEY (habitId, date)
    );

    CREATE INDEX IF NOT EXISTS idx_habits_userId ON habits(userId);
    CREATE INDEX IF NOT EXISTS idx_checkins_habit ON checkins(habitId);
  `);

	seedIfEmpty(conn);
	g.__habitsDb = conn;
	return conn;
}

function seedIfEmpty(conn: Database.Database) {
	const { c } = conn.prepare("SELECT COUNT(*) AS c FROM habits").get() as {
		c: number;
	};
	if (c > 0) return;

	const today = new Date();
	const iso = (d: Date) => d.toISOString().slice(0, 10);
	const minus = (n: number) => {
		const d = new Date(today);
		d.setDate(d.getDate() - n);
		return iso(d);
	};

	const insertHabit = conn.prepare(
		`INSERT INTO habits (id, userId, name, notes, createdAt)
     VALUES (@id, @userId, @name, @notes, @createdAt)`,
	);
	const insertCheckin = conn.prepare(
		`INSERT INTO checkins (habitId, date) VALUES (?, ?)`,
	);

	const tx = conn.transaction(() => {
		const now = new Date().toISOString();
		insertHabit.run({
			id: "h_water",
			userId: "u_alice",
			name: "Drink water",
			notes: "Aim for **2 litres** a day.",
			createdAt: now,
		});
		[0, 1, 2].forEach((n) => insertCheckin.run("h_water", minus(n)));

		insertHabit.run({
			id: "h_read",
			userId: "u_alice",
			name: "Read for 20 minutes",
			notes: "Currently reading _The Pragmatic Programmer_.",
			createdAt: now,
		});
		[1, 3].forEach((n) => insertCheckin.run("h_read", minus(n)));

		insertHabit.run({
			id: "h_meditate",
			userId: "u_bob",
			name: "Bob's private meditation log",
			notes: "Personal stuff, please do not read.",
			createdAt: now,
		});
		[0, 2].forEach((n) => insertCheckin.run("h_meditate", minus(n)));
	});
	tx();
}

function hydrate(
	conn: Database.Database,
	row: Omit<StoredHabit, "checkins">,
): StoredHabit {
	const checkins = conn
		.prepare("SELECT date FROM checkins WHERE habitId = ? ORDER BY date")
		.all(row.id) as StoredCheckin[];
	return { ...row, checkins };
}

export const db = {
	listForUser(userId: string): StoredHabit[] {
		const conn = open();
		const rows = conn
			.prepare(
				"SELECT id, userId, name, notes, createdAt FROM habits WHERE userId = ? ORDER BY createdAt",
			)
			.all(userId) as Omit<StoredHabit, "checkins">[];
		return rows.map((r) => hydrate(conn, r));
	},

	get(id: string): StoredHabit | undefined {
		const conn = open();
		const row = conn
			.prepare(
				"SELECT id, userId, name, notes, createdAt FROM habits WHERE id = ?",
			)
			.get(id) as Omit<StoredHabit, "checkins"> | undefined;
		return row ? hydrate(conn, row) : undefined;
	},

	/**
	 * Create a new habit. `input` may carry any fields the client supplies —
	 * we just spread it into the stored record alongside our generated id.
	 */
	create(
		input: Partial<StoredHabit> & { name: string; userId: string },
	): StoredHabit {
		const conn = open();
		const generatedId = "h_" + Math.random().toString(36).slice(2, 8);
		const row = {
			id: generatedId,
			notes: "",
			createdAt: new Date().toISOString(),
			...input,
		};
		conn
			.prepare(
				`INSERT OR REPLACE INTO habits (id, userId, name, notes, createdAt)
         VALUES (@id, @userId, @name, @notes, @createdAt)`,
			)
			.run({
				id: row.id,
				userId: row.userId,
				name: row.name,
				notes: row.notes ?? "",
				createdAt: row.createdAt,
			});
		return this.get(row.id)!;
	},

	remove(id: string): boolean {
		const conn = open();
		const info = conn.prepare("DELETE FROM habits WHERE id = ?").run(id);
		return info.changes > 0;
	},

	addCheckin(id: string, date: string): StoredHabit | undefined {
		const conn = open();
		const exists = conn.prepare("SELECT 1 FROM habits WHERE id = ?").get(id);
		if (!exists) return undefined;
		conn
			.prepare("INSERT OR IGNORE INTO checkins (habitId, date) VALUES (?, ?)")
			.run(id, date);
		return this.get(id);
	},

	/** Substring search by habit name, regex-powered. */
	search(query: string): StoredHabit[] {
		const conn = open();
		const re = new RegExp(query, "i");
		const rows = conn
			.prepare("SELECT id, userId, name, notes, createdAt FROM habits")
			.all() as Omit<StoredHabit, "checkins">[];
		return rows.filter((r) => re.test(r.name)).map((r) => hydrate(conn, r));
	},
};
