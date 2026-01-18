import { cookies } from "next/headers";

const NESTJS_URL = process.env.API_BUSINESS_URL;

export async function refreshServerToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const res = await fetch(`${NESTJS_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                Cookie: cookieHeader,
                "x-api-key": process.env.API_KEY || "",
            },
        });

        if (!res.ok) return null;

        const json = await res.json();
        const newAccessToken = json?.data?.access_token;

        if (newAccessToken) {
            // Update the cookie in the response for the browser
            cookieStore.set("accessToken", newAccessToken);
            return newAccessToken;
        }

        return null;
    } catch {
        return null;
    }
}
