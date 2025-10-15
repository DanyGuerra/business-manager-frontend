import { ApiResponse } from "@/app/types/auth";
import { BusinessIdHeader } from "@/consts/consts";
import { useAxios } from "@/lib/axios";

export type CreateOption = {
  option_group_id: string;
  name: string;
  price: number;
  available: boolean;
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
  };
}
