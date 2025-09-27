import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../../headersUtils";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;

  try {
    const res = await fetch(`${NESTJS_URL}/products/${productId}`, {
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const body = await req.json();

  try {
    const res = await fetch(`${NESTJS_URL}/products/${productId}`, {
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
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
