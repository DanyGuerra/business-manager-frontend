
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole, UserRolesBusiness } from "@/lib/useUserRolesBusiness";

interface UserRolesState {
    userRolesByBusiness: Record<string, UserRolesBusiness[]>;
    currentBusinessId: string | null;
    loadingRoles: boolean;
    setUserRoles: (businessId: string, roles: UserRolesBusiness[]) => void;
    setCurrentBusinessId: (businessId: string) => void;
    setLoadingRoles: (loading: boolean) => void;
    hasRole: (roleIds: number[]) => boolean;
    canEdit: (allowedRoles?: UserRole[]) => boolean;
    canDelete: (allowedRoles?: UserRole[]) => boolean;
    canCreate: (allowedRoles?: UserRole[]) => boolean;
}

export const useUserRolesStore = create<UserRolesState>()(
    persist(
        (set, get) => ({
            userRolesByBusiness: {},
            currentBusinessId: null,
            loadingRoles: false,
            setUserRoles: (businessId, roles) =>
                set((state) => ({
                    userRolesByBusiness: {
                        ...state.userRolesByBusiness,
                        [businessId]: roles,
                    },
                })),
            setCurrentBusinessId: (businessId) => set({ currentBusinessId: businessId }),
            setLoadingRoles: (loading) => set({ loadingRoles: loading }),
            hasRole: (roleIds) => {
                const { userRolesByBusiness, currentBusinessId } = get();
                if (!currentBusinessId) return false;
                const userRoles = userRolesByBusiness[currentBusinessId] || [];
                return userRoles.some((role) => roleIds.includes(role.role_id));
            },
            canEdit: (allowedRoles) => {
                const { userRolesByBusiness, currentBusinessId } = get();
                if (!currentBusinessId) return false;
                const userRoles = userRolesByBusiness[currentBusinessId] || [];
                const roles = allowedRoles ?? [UserRole.OWNER, UserRole.ADMIN];
                return userRoles.some((role) => roles.includes(role.role_id));
            },
            canDelete: (allowedRoles) => {
                const { userRolesByBusiness, currentBusinessId } = get();
                if (!currentBusinessId) return false;
                const userRoles = userRolesByBusiness[currentBusinessId] || [];
                const roles = allowedRoles ?? [UserRole.OWNER];
                return userRoles.some((role) => roles.includes(role.role_id));
            },
            canCreate: (allowedRoles) => {
                const { userRolesByBusiness, currentBusinessId } = get();
                if (!currentBusinessId) return false;
                const userRoles = userRolesByBusiness[currentBusinessId] || [];
                const roles = allowedRoles ?? [UserRole.OWNER, UserRole.ADMIN];
                return userRoles.some((role) => roles.includes(role.role_id));
            },
        }),
        {
            name: "user-roles-store",
            partialize: (state) => ({ userRolesByBusiness: state.userRolesByBusiness }), // Only persist the roles map
        }
    )
);
