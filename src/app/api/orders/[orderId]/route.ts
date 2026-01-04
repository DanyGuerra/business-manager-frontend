import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../../headersUtils";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    try {
        const res = await fetch(`${NESTJS_URL}/orders/${orderId}`, {
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
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    try {
        const body = await req.json();

        const res = await fetch(`${NESTJS_URL}/orders/${orderId}`, {
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