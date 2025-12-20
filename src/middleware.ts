import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.includes(".") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    const hasToken = request.cookies.has("accessToken");
    const isPublicPath = publicPaths.includes(pathname);

    if (!isPublicPath && !hasToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicPath && hasToken && pathname !== "/") {
        if (pathname === "/login" || pathname === "/register") {
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
