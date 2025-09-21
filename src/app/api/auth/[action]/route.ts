import { NextResponse } from "next/server";

const ACTIONS: Record<string, string> = {
  signup: "/auth/signup",
  login: "/auth/login",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  updatePassword: "/auth/update-password",
};

export async function POST(
  req: Request,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  if (action === "logout") {
    const response = NextResponse.json(
      { message: "Logged out" },
      { status: 200 }
    );

    response.cookies.set("token", "", { path: "/", maxAge: 0 });

    return response;
  }

  const path = ACTIONS[action];
  if (!path)
    return NextResponse.json({ message: "Not Found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const targetUrl = `${process.env.API_BUSINESS_URL}${path}`;
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  const response = NextResponse.json(data, { status: res.status });

  const setCookies = (res.headers as any).raw?.()["set-cookie"];
  if (setCookies?.length) {
    setCookies.forEach((cookie: any) =>
      response.headers.append("set-cookie", cookie)
    );
  } else {
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
  }

  return response;
}
