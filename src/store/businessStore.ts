import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Business } from "@/lib/useBusinessApi";

interface BusinessState {
  business: Business | null;
  businessId: string;
  setBusiness: (b: Business | null) => void;
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => {
      return {
        business: null,
        businessId: "",

        setBusiness: (b) =>
          set({
            business: b,
            businessId: b ? b.id : "",
          }),

        clearBusiness: () =>
          set({
            business: null,
            businessId: "",
          }),
      };
    },
    { name: "business-store" }
  )
);
