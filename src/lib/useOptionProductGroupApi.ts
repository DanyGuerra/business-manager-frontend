import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";

export type CreateProductOptionGroupDto = {
  product_id: string;
  option_group_id: string;
};

export function useOptionProductGroupApi() {
  const api = useAxios();

  return {
    create: (data: CreateProductOptionGroupDto, businessId: string) =>
      api
        .post<ApiResponse>("/product-option-group", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    delete: (data: CreateProductOptionGroupDto, businessId: string) =>
      api
        .delete<ApiResponse>(
          `/product-option-group?productId=${data.product_id}&optionGroupId=${data.option_group_id}`,
          {
            headers: { [BusinessIdHeader]: businessId },
          }
        )
        .then((res) => res.data),
  };
}
