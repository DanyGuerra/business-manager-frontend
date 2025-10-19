import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";

type CreateProductGroupDto = {
  name: string;
  description: string;
};

type UpdateProductGroupDto = {
  name?: string;
  description?: string;
};

export function useProductGroupApi() {
  const api = useAxios();

  return {
    createProductGroup: (data: CreateProductGroupDto, businessId: string) =>
      api
        .post<ApiResponse>("/product-group", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    deleteProductGroup: (productGroupId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product-group/${productGroupId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),

    updateProductGroup: (
      productGroupId: string,
      businessId: string,
      data: UpdateProductGroupDto
    ) =>
      api
        .patch<ApiResponse>(`/product-group/${productGroupId}`, data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
  };
}
