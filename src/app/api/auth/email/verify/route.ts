import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../../headersUtils";

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        const res = await fetch(`${NESTJS_URL}/auth/verify-email?token=${token}`, {
            method: "GET",
            headers: {
                ...buildHeaders(req),
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
