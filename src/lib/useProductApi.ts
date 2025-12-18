import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { Product } from "./useBusinessApi";

export type CreateProductDto = {
  group_product_id: string;
  name: string;
  description: string;
  base_price: number;
  available: boolean;
};
export type UpdateProductDto = {
  name: string;
  description: string;
  base_price: number;
  available: boolean;
};

export type ProductFull = Product & {
  group_product_id: string;
  option_groups: OptionGroup[];
}

export type ProductPagination = {
  data: Product[];
  totalPages: number;
  total: number;
  page: number;
  limit: number;

}

export type ProductParams = {
  page?: number;
  limit?: number;
  search?: string;
  product_group_id?: string;
};

import { useCallback, useMemo } from "react";
import { OptionGroup } from "./useOptionGroupApi";

export function useProductApi() {
  const api = useAxios();

  const createProduct = useCallback(
    (data: CreateProductDto[], businessId: string) =>
      api
        .post<ApiResponse>("/product", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const updateProduct = useCallback(
    (
      data: UpdateProductDto,
      productId: string,
      businessId: string
    ) =>
      api
        .put<ApiResponse>(`/product/${productId}`, data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const deleteProduct = useCallback(
    (productId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product/${productId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const getProductsByBusinessId = useCallback(
    (businessId: string, params: ProductParams) =>
      api
        .get<ApiResponse<ProductPagination>>(`/product/business/${businessId}`, {
          params,
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  const getProductsByProductGroupId = useCallback(
    (businessId: string, params: ProductParams) =>
      api
        .get<ApiResponse<ProductFull[]>>("/product", {
          params,
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    [api]
  );

  return useMemo(
    () => ({
      createProduct,
      updateProduct,
      deleteProduct,
      getProductsByBusinessId,
      getProductsByProductGroupId,
    }),
    [
      createProduct,
      updateProduct,
      deleteProduct,
      getProductsByBusinessId,
      getProductsByProductGroupId,
    ]
  );
}
