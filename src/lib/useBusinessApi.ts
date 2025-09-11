import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "@/lib/axios";

export type CreateBusinessResponse = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
};

export function useBusinessApi() {
  const api = useAxios();

  return {
    getMyBusinesses: () => api.get("/business/owner").then((res) => res.data),
    getBusinessProducts: (businessId: string) =>
      api
        .get("/business/products", { headers: { "business-id": businessId } })
        .then((res) => res.data),
    getBusiness: (businessId: string) =>
      api
        .get("/business", { headers: { "business-id": businessId } })
        .then((res) => res.data),
    createBusiness: (data: any) =>
      api
        .post<ApiResponse<CreateBusinessResponse>>("/business", data)
        .then((res) => res.data),
    updateBusiness: (businessId: string, data: any) =>
      api
        .put("/business", data, { headers: { "business-id": businessId } })
        .then((res) => res.data),
    deleteBusiness: (businessId: string) =>
      api
        .delete("/business", { headers: { "business-id": businessId } })
        .then((res) => res.data),
    getAllBusinesses: () => api.get("/business/all").then((res) => res.data),
  };
}
