import { NextRequest, NextResponse } from "next/server";
import { NESTJS_URL, buildHeaders } from "../headersUtils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${NESTJS_URL}/product-option`, {
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const optionGroupId = searchParams.get("optionGroupId");

    const res = await fetch(
      `${NESTJS_URL}/product-option-group?product_id=${productId}&option_group_id=${optionGroupId}`,
      {
        method: "DELETE",
        headers: {
          ...buildHeaders(req),
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
