import { create } from "zustand";

type LoadingKeys = string;

export enum LoadingsKeyEnum {
  CREATE_BUSINESS = "createBusiness",
  UPDATE_BUSINESS = "updateBusiness",
  GET_BUSINESS = "getBusiness",
  GET_USER = "getUser",
  CREATE_PRODUCT_GROUP = "createProductGroup",
  UPDATE_PRODUCT_GROUP = "updateProductGroup",
  CREATE_PRODUCT = "createProduct",
  UPDATE_PRODUCT = "updateProduct",
  CREATE_GROUP_OPTION = "createGroupOption",
  UPDATE_GROUP_OPTION = "updateGroupOption",
  CREATE_OPTION = "createOption",
  UPDATE_OPTION = "updateOption",
  CREATE_PRODUCT_GROUP_OPTION = "createProductGroupOption",
  UPDATE_PRODUCT_GROUP_OPTION = "updateProductGroupOption",
  LOGIN = "login",
  SIGNUP = "signup",
  CREATE_ORDER = "createOrder",
  UPDATE_ORDER = "updateOrder",
  RESEND_VERIFICATION = "resendVerification",
  CONFIRM_EMAIL = "confirmEmail",
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
