import { create } from "zustand";
import { UserRolesBusiness } from "@/lib/useUserRolesBusiness";

interface UserRolesState {
    userRoles: UserRolesBusiness[];
    loadingRoles: boolean;
    setUserRoles: (roles: UserRolesBusiness[]) => void;
    setLoadingRoles: (loading: boolean) => void;
    hasRole: (roleIds: number[]) => boolean;
}

export const useUserRolesStore = create<UserRolesState>((set, get) => ({
    userRoles: [],
    loadingRoles: false,
    setUserRoles: (roles) => set({ userRoles: roles }),
    setLoadingRoles: (loading) => set({ loadingRoles: loading }),
    hasRole: (roleIds) => {
        const { userRoles } = get();
        return userRoles.some((role) => roleIds.includes(role.role_id));
    },
}));
