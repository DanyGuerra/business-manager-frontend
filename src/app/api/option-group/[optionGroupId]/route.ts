import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../headersUtils";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ optionGroupId: string }> }
) {
  try {
    const body = await req.json();
    const { optionGroupId } = await context.params;

    const res = await fetch(`${NESTJS_URL}/option-group/${optionGroupId}`, {
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
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
