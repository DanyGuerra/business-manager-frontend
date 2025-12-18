import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../headersUtils";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ productGroupId: string }> }
) {
  try {
    const { productGroupId } = await context.params;

    const res = await fetch(`${NESTJS_URL}/product-group/${productGroupId}`, {
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
  context: { params: Promise<{ productGroupId: string }> }
) {
  try {
    const { productGroupId } = await context.params;

    const res = await fetch(`${NESTJS_URL}/product-group/${productGroupId}`, {
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
  context: { params: Promise<{ productGroupId: string }> }
) {
  try {
    const { productGroupId } = await context.params;

    const body = await req.json();

    const res = await fetch(`${NESTJS_URL}/product-group/${productGroupId}`, {
      method: "PATCH",
      headers: {
        ...buildHeaders(req),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
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
