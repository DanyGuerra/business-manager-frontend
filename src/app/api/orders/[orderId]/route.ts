import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../../headersUtils";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    try {
        const res = await fetch(`${NESTJS_URL}/orders/${orderId}`, {
            method: "DELETE",
            headers: {
                ...buildHeaders(req),
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}