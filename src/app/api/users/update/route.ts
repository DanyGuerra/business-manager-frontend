import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, NESTJS_URL } from "../../headersUtils";


export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        const res = await fetch(`${NESTJS_URL}/users/update`, {
            method: "PATCH",
            headers: {
                ...buildHeaders(request),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}