import { type NextRequest, NextResponse } from "next/server";

// Browser preflight + cross-origin support so the marketing site
// (and our staff tooling) can call the API from anywhere.
export function middleware(req: NextRequest) {
	const origin = req.headers.get("origin") ?? "*";

	if (req.method === "OPTIONS") {
		return new NextResponse(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": origin,
				"Access-Control-Allow-Credentials": "true",
				"Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
				"Access-Control-Allow-Headers":
					"Content-Type, X-User-Id, X-Admin-Token",
			},
		});
	}

	const res = NextResponse.next();
	res.headers.set("Access-Control-Allow-Origin", origin);
	res.headers.set("Access-Control-Allow-Credentials", "true");
	return res;
}

export const config = {
	matcher: "/api/:path*",
};
