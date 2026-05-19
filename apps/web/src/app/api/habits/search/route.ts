import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	const q = new URL(req.url).searchParams.get("q") ?? "";
	return NextResponse.json({ habits: db.search(q) });
}
