import { ApiResponse } from "@/app/types/auth";
import { BusinessIdHeader } from "@/consts/consts";
import { useAxios } from "@/lib/axios";

export type CreateOption = {
  option_group_id: string;
  name: string;
  price: number;
  available: boolean;
};

export type UpateProductOptionDto = {
  name?: string;
  price?: number;
  available?: boolean;
};

export function useProductOptionApi() {
  const api = useAxios();

  return {
    createOption: (businessId: string, data: CreateOption) =>
      api
        .post<ApiResponse>("/product-option", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),

    deleteProductOption: (productOptionId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product-option/${productOptionId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),

    updateProductOption: (
      productOptionId: string,
      businessId: string,
      data: UpateProductOptionDto
    ) =>
      api
        .patch<ApiResponse>(`/product-option/${productOptionId}`, data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
  };
}
