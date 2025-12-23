import { User } from "@/app/types/auth";
import { UserRolesBusiness } from "./useUserRolesBusiness";

const NESTJS_URL = process.env.API_BUSINESS_URL;

export async function getMe(token: string): Promise<User | null> {
    try {
        const res = await fetch(`${NESTJS_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch {
        return null;
    }
}

export async function getUserRoles(userId: string, businessId: string, token: string): Promise<UserRolesBusiness[]> {
    try {
        const res = await fetch(`${NESTJS_URL}/user-business-roles/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "x-business-id": businessId,
            },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data;
    } catch {
        return [];
    }
}
