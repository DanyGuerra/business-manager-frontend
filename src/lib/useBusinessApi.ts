import { ApiResponse } from "@/app/types/auth";
import { BusinessIdHeader } from "@/consts/consts";
import { useAxios } from "@/lib/axios";

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

export type Option = {
  id: string;
  option_group_id: string;
  name: string;
  price: number;
  available: boolean;
};

export type OptionGroup = {
  id: string;
  name: string;
  options: Option[];
};

export type Product = {
  id: string;
  group_product_id: string;
  name: string;
  description: string;
  base_price: number;
  available: boolean;
  option_groups: OptionGroup[];
};

export type ProductGroup = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  products: Product[];
};

export type BusinessFull = Business & {
  productGroup: ProductGroup[];
};

export function useBusinessApi() {
  const api = useAxios();

  return {
    getMyBusinesses: () =>
      api
        .get<ApiResponse<Business[]>>("/business/owner")
        .then((res) => res.data),
    getBusinessProducts: (businessId: string) =>
      api
        .get<ApiResponse<BusinessFull>>("/business/products", {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    getBusiness: (businessId: string) =>
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
  };
}
