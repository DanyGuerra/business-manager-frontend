import { NextRequest } from "next/server";
import { HeadersEnum } from "../types/headers";

export const NESTJS_URL = process.env.API_BUSINESS_URL;

export function buildHeaders(req: NextRequest): Record<string, string> {
  const token = req.headers.get("authorization") || "";
  const businessId = req.headers.get(HeadersEnum.BusinessId) || "";

  const headers: Record<string, string> = {
    Authorization: token,
    "Content-Type": "application/json",
  };
  if (businessId) headers[HeadersEnum.BusinessId] = businessId;

  return headers;
}
