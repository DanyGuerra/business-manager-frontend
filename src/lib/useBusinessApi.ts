import { ApiResponse } from "@/app/types/auth";
import { BusinessIdHeader } from "@/consts/consts";
import { useMemo } from "react";
import { useAxios } from "@/lib/axios";
import { OptionGroup } from "./useOptionGroupApi";

export type CreateBusinessResponse = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
};

export type Business = {
  id: string;
  name: string;
  address: string;
};

export type Product = {
  id: string;
  product_group: ProductGroup;
  name: string;
  description: string;
  base_price: number;
  available: boolean;
  option_groups: OptionGroup[];
};

export type ProductGroup = {
  id: string;
  name: string;
  description: string;
  products: Product[];
};

export type BusinessFull = Business & {
  product_group: ProductGroup[];
};



export function useBusinessApi() {
  const api = useAxios();

  return useMemo(() => ({
    getMyBusinesses: () =>
      api
        .get<ApiResponse<Business[]>>("/business/owner")
        .then((res) => res.data),
    getBusinessById: (businessId: string) =>
      api
        .get<ApiResponse<Business>>("/business", {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    createBusiness: (data: any) =>
      api
        .post<ApiResponse<CreateBusinessResponse>>("/business", data)
        .then((res) => res.data),
    updateBusiness: (businessId: string, data: any) =>
      api
        .put("/business", data, { headers: { [BusinessIdHeader]: businessId } })
        .then((res) => res.data),
    deleteBusiness: (businessId: string) =>
      api
        .delete("/business", { headers: { [BusinessIdHeader]: businessId } })
        .then((res) => res.data),
    getAllBusinesses: () => api.get("/business/all").then((res) => res.data),
  }), [api]);
}
