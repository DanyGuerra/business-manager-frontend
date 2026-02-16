import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/signup", "/auth/confirm", "/auth/forgot-password", "/auth/reset-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.includes(".") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    const hasToken = request.cookies.get("accessToken")?.value;
    const hasRefreshToken = request.cookies.get("refreshToken")?.value;
    const isPublicPath = publicPaths.includes(pathname);

    if (!isPublicPath && !hasToken && !hasRefreshToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicPath && hasToken && pathname !== "/") {
        if (pathname === "/login" || pathname === "/signup") {
            return NextResponse.redirect(new URL("/profile", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
