import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { action: string } }
) {
  const { action } = params;
  const body = await req.json().catch(() => null);

  let targetUrl = "";
  switch (action) {
    case "signup":
      targetUrl = `${process.env.API_BUSINESS_URL}/auth/signup`;
      break;
    case "login":
      targetUrl = `${process.env.API_BUSINESS_URL}/auth/login`;
      break;
    case "refresh":
      targetUrl = `${process.env.API_BUSINESS_URL}/auth/refresh`;
      break;
    case "logout":
      targetUrl = `${process.env.API_BUSINESS_URL}/auth/logout`;
      break;
    case "update-password":
      targetUrl = `${process.env.API_BUSINESS_URL}/auth/update-password`;
      break;
    default:
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") || "",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  const response = NextResponse.json(data, { status: res.status });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
