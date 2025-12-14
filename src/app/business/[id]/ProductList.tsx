"use client";

import { Product } from "@/lib/useBusinessApi";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { toast } from "sonner";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { PackageIcon, PlusIcon } from "lucide-react";
import ProductListItem from "./ProductListItem";

type ProductListProps = {
  products: Product[];
  productGroupId: string;
};
export default function ProductList({ products, productGroupId }: ProductListProps) {
  const productApi = useProductApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();

  async function handleCreateProduct(
    data: ProductValues,
    businessId: string,
    productGroupId: string
  ) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
      const priceNumber = Number(data.base_price);
      const dataFormatted: CreateProductDto = {
        ...data,
        description: data.description ?? "",
        base_price: priceNumber,
        group_product_id: productGroupId,
      };

      await productApi.createProduct([dataFormatted], businessId);
      await getBusiness(businessId);
      toast.success("Producto creado", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
    }
  }

  return (
    <>
      {products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <PackageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No hay productos</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
            Comienza agregando productos a este grupo para armar tu menú.
          </p>

          <CustomDialog
            modalTitle="Agregar producto"
            modalDescription="Agrega un producto para tu menú"
            textButtonTrigger="Agregar primer producto"
            icon={<PlusIcon className="h-4 w-4 mr-2" />}
          >
            <FormProduct
              buttonTitle="Guardar"
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
              handleSubmitButton={(data) =>
                handleCreateProduct(data, businessId, productGroupId)
              }
            />
          </CustomDialog>
        </div>
      )}
    </>
  );
}
