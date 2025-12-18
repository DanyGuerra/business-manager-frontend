import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { ProductGroup } from "./useBusinessApi";
import { BusinessIdHeader } from "@/consts/consts";

type CreateProductGroupDto = {
  name: string;
  description: string;
};

type UpdateProductGroupDto = {
  name?: string;
  description?: string;
};

import { useCallback, useMemo } from "react";

export function useProductGroupApi() {
  const api = useAxios();

  const createProductGroup = useCallback(
    (data: CreateProductGroupDto, businessId: string) =>
      api
        .post<ApiResponse>("/product-group", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const deleteProductGroup = useCallback(
    (productGroupId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product-group/${productGroupId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const updateProductGroup = useCallback(
    (
      productGroupId: string,
      businessId: string,
      data: UpdateProductGroupDto
    ) =>
      api
        .patch<ApiResponse>(`/product-group/${productGroupId}`, data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const getProductGroup = useCallback(
    (productGroupId: string, businessId: string) =>
      api
        .get<ApiResponse<ProductGroup>>(`/product-group/${productGroupId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const getProductGroupsByBusinessId = useCallback(
    (businessId: string) =>
      api
        .get<ApiResponse<ProductGroup[]>>("/product-group", {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  return useMemo(
    () => ({
      createProductGroup,
      deleteProductGroup,
      updateProductGroup,
      getProductGroup,
      getProductGroupsByBusinessId,
    }),
    [
      createProductGroup,
      deleteProductGroup,
      updateProductGroup,
      getProductGroup,
      getProductGroupsByBusinessId,
    ]
  );
}
