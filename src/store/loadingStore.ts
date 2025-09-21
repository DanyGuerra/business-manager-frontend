import { create } from "zustand";

type LoadingKeys = string;

export enum LoadingsKeyEnum {
  CREATE_BUSINESS = "createBusiness",
  CREATE_PRODUCT_GROUP = "createProductGroup",
  UPDATE_PRODUCT_GROUP = "updateProductGroup",
  CREATE_PRODUCT = "createProduct",
  UPDATE_PRODUCT = "updateProduct",
  LOGIN = "createBusiness",
  SIGNUP = "createBusiness",
}

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
