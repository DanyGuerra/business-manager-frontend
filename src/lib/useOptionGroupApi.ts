import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";

export type CreateOptionGroupDto = {
  name: string;
  min_options: number;
  max_options: number;
  display_order?: number | null;
  available: boolean;
};

export type ResponseSucessOptionGroup = {
  name: string;
  available: true;
  created_at: string;
  display_order: number | null;
  id: string;
  max_options: number;
  min_options: number;
  updated_at: string;
};

export function useOptionGroupApi() {
  const api = useAxios();

  return {
    create: (data: CreateOptionGroupDto, businessId: string) =>
      api
        .post<ApiResponse<ResponseSucessOptionGroup>>("/option-group", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
  };
}
