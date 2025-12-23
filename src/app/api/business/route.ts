import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "./utils";
import { buildHeaders } from "../headersUtils";

export async function GET(req: NextRequest) {
  try {
    const { status, data } = await proxyFetch("", {
      method: "GET",
      headers: buildHeaders(req),
    });
    return NextResponse.json(data, { status });
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
    const { status, data } = await proxyFetch("", {
      method: "POST",
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, data } = await proxyFetch("", {
      method: "PUT",
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { status, data } = await proxyFetch("", {
      method: "DELETE",
      headers: buildHeaders(req),
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json(
      { message: "Internal proxy error" },
      { status: 500 }
    );
  }
}
