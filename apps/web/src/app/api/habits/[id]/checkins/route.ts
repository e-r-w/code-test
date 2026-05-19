import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { id: string } }) {
	const body: any = await req.json().catch(() => ({}));

	// Use the client-supplied date if present, otherwise default to today (UTC).
	const date: string =
		body.checkinDate ?? new Date().toISOString().slice(0, 10);

	const habit = db.addCheckin(ctx.params.id, date);
	if (!habit) return NextResponse.json({ error: "not found" }, { status: 404 });

	return NextResponse.json({ habit });
}
