import { NextRequest, NextResponse } from "next/server";

const NESTJS_URL = `${process.env.API_BUSINESS_URL}/business`;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.split("/api/business")[1];
  const token = req.headers.get("authorization");
  const businessId = req.headers.get("business-id");

  const headers: Record<string, string> = {
    Authorization: token || "",
    "Content-Type": "application/json",
  };
  if (businessId) headers["business-id"] = businessId;

  const res = await fetch(`${NESTJS_URL}${path || ""}`, {
    method: "GET",
    headers,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  const body = await req.json();

  const res = await fetch(NESTJS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token || "" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization");
  const businessId = req.headers.get("business-id");
  const body = await req.json();

  const res = await fetch(NESTJS_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
      "business-id": businessId || "",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization");
  const businessId = req.headers.get("business-id");

  const res = await fetch(NESTJS_URL, {
    method: "DELETE",
    headers: { Authorization: token || "", "business-id": businessId || "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
