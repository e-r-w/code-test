# Habits — Code Test

Hi! Thanks for taking the time to do this.

You're being handed a small monorepo for a **Habit Tracker** product:

- `apps/web` — Next.js (App Router) hosting the public REST API and a small internal admin dashboard.
- `apps/mobile` — Expo / React Native app the end-users actually use to record habits. Uses **Expo Router** (file-based routing under `apps/mobile/app/`).
- `packages/shared` — shared TypeScript types.

It "works" — you can install, run, and click around. **But it has a number of bugs.** Some are very obvious, some are subtle, a couple are downright nasty. We're more interested in *how you find them* and *how you reason about them* than in whether you fix every single one.

## What we're looking for

1. **Triage.** Skim the code, run the apps, identify what feels wrong. Keep a running list (a `BUGS.md` is perfect) — even if you don't fix them all, we want to see what you noticed and your hypothesis for the cause.
2. **Root-cause thinking.** For at least 3 bugs, fix them and write 1–3 sentences on *why* the original code was wrong (not just what you changed).
3. **Judgement.** Some "bugs" are actually code smells, perf issues, or **security weaknesses** rather than functional defects. Call those out too, but don't get sucked into rewriting everything.

Three rough buckets are in scope:
- **Functional bugs** — things visibly broken in the UI / API.
- **Code smells & perf** — things that work but shouldn't ship.
- **Security** — assume this API will be exposed to the public internet. Treat the codebase as a mini pentest target as well as a debug task.

## Timebox

Please aim for **~90 minutes**. If you blow past that, stop and write down what you would have done next. We won't penalise an unfinished test — we will penalise a sprawling one.

## Setup

This repo uses **pnpm** workspaces. If you don't have it: `npm i -g pnpm` or `corepack enable`.

```sh
# from this directory
pnpm install

# terminal 1 — Next.js (API + dashboard) on http://localhost:3000
pnpm --filter web dev

# terminal 2 — Expo (use Expo Go, iOS Simulator, or Android emulator)
pnpm --filter mobile start
```

The mobile app talks to the Next.js API. Data is persisted to a local SQLite file at `apps/web/.data/habits.sqlite` (gitignored). To reset state, stop the dev server and delete that file.

> **Note on `better-sqlite3`:** it's a native module, so the first `pnpm install` will compile against your Node version. If it errors, make sure you're on Node 18+ and re-run `pnpm rebuild better-sqlite3`.

> **Note on Android:** if you're running on an Android emulator and the app can't reach the API, that's one of the things you should figure out. (Hint in `apps/mobile/src/api.ts`.)

## What to deliver

- A patch/branch with your changes.
- A `BUGS.md` at the repo root listing what you found, what you fixed, and what you'd do with more time.
- Anything else you think is useful (notes, questions, screenshots).

Good luck — and please don't spend time polishing the UI. We don't care.
