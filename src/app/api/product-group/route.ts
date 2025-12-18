import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../headersUtils";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${NESTJS_URL}/product-group`, {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${NESTJS_URL}/product-group`, {
      method: "POST",
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
