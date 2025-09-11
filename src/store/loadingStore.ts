import { create } from "zustand";

type LoadingKeys = string;

type LoadingState = {
  loadings: Record<LoadingKeys, boolean>;
  startLoading: (key: LoadingKeys) => void;
  stopLoading: (key: LoadingKeys) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  loadings: {},
  startLoading: (key) =>
    set((state) => ({ loadings: { ...state.loadings, [key]: true } })),
  stopLoading: (key) =>
    set((state) => ({ loadings: { ...state.loadings, [key]: false } })),
}));
