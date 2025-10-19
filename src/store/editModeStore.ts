import { create } from "zustand";

type LoadingState = {
  isEditMode: boolean;
  setEditMode: (state: boolean) => void;
  toggleEditMode: () => void;
};

export const useEditModeStore = create<LoadingState>((set) => ({
  isEditMode: false,
  setEditMode: (state) => set({ isEditMode: state }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
}));
