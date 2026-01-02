import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../headersUtils";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${NESTJS_URL}/users/me`, {
      method: "GET",
      headers: buildHeaders(req),
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



