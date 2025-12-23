import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../headersUtils";

export async function GET(req: NextRequest) {
    try {
        const res = await fetch(`${NESTJS_URL}/user-business-roles`, {
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