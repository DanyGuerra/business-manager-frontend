import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "../utils";
import { buildHeaders } from "../../headersUtils";

export async function GET(req: NextRequest) {
  try {
    const { status, data } = await proxyFetch("/all", {
      method: "GET",
      headers: buildHeaders(req),
    });
    return NextResponse.json(data, { status });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal proxy error" },
      { status: 500 }
    );
  }
}
