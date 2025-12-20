import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/app/types/auth";

interface UserState {
    user: User | null;
    isLoading: boolean;
    isChecked: boolean;
    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsChecked: (isChecked: boolean) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,
            isChecked: false,
            setUser: (user) => set({ user }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setIsChecked: (isChecked) => set({ isChecked }),
            logout: () => set({ user: null, isChecked: true, isLoading: false }),
        }),
        {
            name: "user-store",
            partialize: (state) => ({ user: state.user }),
        }
    )
);
