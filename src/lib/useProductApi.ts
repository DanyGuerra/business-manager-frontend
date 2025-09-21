import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";

export type ProductDto = {
  group_product_id: string;
  name: string;
  description: string;
  base_price: number;
  available: boolean;
};

export function useProductApi() {
  const api = useAxios();

  return {
    createProduct: (data: ProductDto, businessId: string) =>
      api
        .post<ApiResponse>("/product", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    deleteProduct: (productId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product/${productId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
  };
}
