import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../../headersUtils";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await context.params;

    const res = await fetch(
      `${NESTJS_URL}/option-group/business/${businessId}`,
      {
        method: "GET",
        headers: {
          ...buildHeaders(req),
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
