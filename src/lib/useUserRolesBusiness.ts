import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { useMemo } from "react";

export enum UserRole {
    OWNER = 1,
    ADMIN = 2,
    WAITER = 3,
}

export type Role = {
    id: UserRole;
    name: string;
    created_at: string;
    updated_at: string;
}

export type UserRolesBusiness = {
    user_id: string;
    business_id: string;
    role_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user: {
        id: string;
        email: string;
        name: string;
    };
    role: Role;
}

export type AddUserRoleByEmailDto = {
    email: string;
    role_id: number;
}

export function useUserRolesBusinessApi() {
    const api = useAxios();

    return useMemo(() => ({
        getUsersRolesByBusinessId: (businessId: string) =>
            api
                .get<ApiResponse<UserRolesBusiness[]>>("/user-roles-business", {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        getUsersRolesByUserId: (userId: string, businessId: string) =>
            api
                .get<ApiResponse<UserRolesBusiness[]>>(`/user-roles-business/user/${userId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        addUserRoleByEmail: (data: AddUserRoleByEmailDto, businessId: string) =>
            api
                .post<ApiResponse<UserRolesBusiness>>("/user-roles-business/user", data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        deleteUserRole: (userId: string, businessId: string) =>
            api
                .delete<ApiResponse<UserRolesBusiness>>(`/user-roles-business/user/${userId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
    }), [api]);
}
