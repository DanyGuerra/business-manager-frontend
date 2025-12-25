import { create } from "zustand";
import { UserRole, UserRolesBusiness } from "@/lib/useUserRolesBusiness";

interface UserRolesState {
    userRoles: UserRolesBusiness[];
    loadingRoles: boolean;
    setUserRoles: (roles: UserRolesBusiness[]) => void;
    setLoadingRoles: (loading: boolean) => void;
    hasRole: (roleIds: number[]) => boolean;
    canEdit: (allowedRoles?: UserRole[]) => boolean;
    canDelete: (allowedRoles?: UserRole[]) => boolean;
    canCreate: (allowedRoles?: UserRole[]) => boolean;
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
    canEdit: (allowedRoles) => {
        const { userRoles } = get();
        const roles = allowedRoles ?? [UserRole.OWNER, UserRole.ADMIN];
        return userRoles.some((role) => roles.includes(role.role_id));
    },
    canDelete: (allowedRoles) => {
        const { userRoles } = get();
        const roles = allowedRoles ?? [UserRole.OWNER];
        return userRoles.some((role) => roles.includes(role.role_id));
    },
    canCreate: (allowedRoles) => {
        const { userRoles } = get();
        const roles = allowedRoles ?? [UserRole.OWNER, UserRole.ADMIN];
        return userRoles.some((role) => roles.includes(role.role_id));
    },
}));
