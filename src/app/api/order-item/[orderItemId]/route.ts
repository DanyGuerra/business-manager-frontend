import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../../headersUtils";

export async function PUT(req: NextRequest, context: { params: Promise<{ orderItemId: string }> }) {
    try {
        const { orderItemId } = await context.params;
        const body = await req.json();
        const res = await fetch(`${NESTJS_URL}/order-items/${orderItemId}`, {
            method: "PATCH",
            headers: {
                ...buildHeaders(req),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
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


