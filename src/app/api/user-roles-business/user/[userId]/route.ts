import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../../../headersUtils";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const res = await fetch(`${NESTJS_URL}/user-business-roles/user/${params.userId}`, {
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
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const res = await fetch(`${NESTJS_URL}/user-business-roles/user/${params.userId}`, {
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