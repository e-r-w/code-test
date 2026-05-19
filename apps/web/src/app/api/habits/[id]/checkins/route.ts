import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = {
  params: Promise<{
    id: string;
  }>
}

export async function POST(req: Request, ctx: Ctx) {
  const body: any = await req.json().catch(() => ({}));
  const params = await ctx.params;

	// Use the client-supplied date if present, otherwise default to today (UTC).
	const date: string =
		body.checkinDate ?? new Date().toISOString().slice(0, 10);

	const habit = db.addCheckin(params.id, date);
	if (!habit) return NextResponse.json({ error: "not found" }, { status: 404 });

	return NextResponse.json({ habit });
}
