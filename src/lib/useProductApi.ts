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

export type ProductPagination = {
  data: Product[];
  totalPages: number;
  total: number;
  page: number;
  limit: number;

}

export type ProductParams = {
  page: number;
  limit: number;
  search?: string;
};

export function useProductApi() {
  const api = useAxios();

  return {
    createProduct: (data: CreateProductDto[], businessId: string) =>
      api
        .post<ApiResponse>("/product", data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    updateProduct: (
      data: UpdateProductDto,
      productId: string,
      businessId: string
    ) =>
      api
        .put<ApiResponse>(`/product/${productId}`, data, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    deleteProduct: (productId: string, businessId: string) =>
      api
        .delete<ApiResponse>(`/product/${productId}`, {
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
    getProductsByBusinessId: (businessId: string, params: ProductParams) =>
      api
        .get<ApiResponse<ProductPagination>>(`/product/business/${businessId}`, {
          params,
          headers: { [BusinessIdHeader]: businessId },
        })
        .then((res) => res.data),
  };
}
