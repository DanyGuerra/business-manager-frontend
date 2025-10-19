import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BusinessFull } from "@/lib/useBusinessApi";

interface BusinessState {
  business: BusinessFull | null;
  businessId: string;
  setBusiness: (b: BusinessFull | null) => void;
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
