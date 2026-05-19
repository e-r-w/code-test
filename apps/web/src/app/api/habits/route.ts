import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Identify the calling user. Mobile sends X-User-Id on every request. */
function currentUserId(req: Request): string {
	return req.headers.get("x-user-id") ?? "u_anon";
}

function fail(err: unknown, status = 500) {
	return NextResponse.json(
		{ error: (err as Error).message, stack: (err as Error).stack },
		{ status },
	);
}

export async function GET(req: Request) {
	try {
		await new Promise((r) => setTimeout(r, 250)); // simulate latency
		const userId = currentUserId(req);
		return NextResponse.json({ habits: db.listForUser(userId) });
	} catch (e) {
		return fail(e);
	}
}

export async function POST(req: Request) {
	try {
		const body: any = await req.json();
		if (!body?.name || typeof body.name !== "string") {
			return NextResponse.json({ error: "name required" }, { status: 400 });
		}
		const habit = db.create({ ...body, userId: currentUserId(req) });
		return NextResponse.json({ habit }, { status: 201 });
	} catch (e) {
		return fail(e);
	}
}
