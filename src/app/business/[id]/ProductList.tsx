"use client";

import { Product } from "@/lib/useBusinessApi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import OptionGroupList from "./OptionGroupList";
import CustomDialog from "@/components/customDialog";
import { Edit2Icon } from "lucide-react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { toast } from "sonner";
import { UpdateProductDto, useProductApi } from "@/lib/useProductApi";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { useState } from "react";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";

type ProductListProps = {
  products: Product[];
};
export default function ProductList({ products }: ProductListProps) {
  const productApi = useProductApi();
  const [open, setOpen] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();

  async function handleDeleteProduct(productId: string) {
    try {
      await productApi.deleteProduct(productId, businessId);
      await getBusiness(businessId);
      toast.success("Se eliminó el producto correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleEditProduct(
    data: ProductValues,
    productId: string,
    businessId: string
  ) {
    const dataUpdate: UpdateProductDto = {
      ...data,
      description: data.description ?? "",
      base_price: Number(data.base_price),
    };
    try {
      startLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
      await productApi.updateProduct(dataUpdate, productId, businessId);
      await getBusiness(businessId);
      toast.success("Se actualizó el producto exitosamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(false);
      stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
    }
  }

  return (
    <>
      {products.length ? (
        <div className="flex flex-col space-y-4">
          {products.map((product) => (
            <Collapsible key={product.id}>
              <CollapsibleTrigger
                className="flex justify-between w-full p-2 bg-muted rounded"
                asChild
              >
                <section className="flex">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        !product.available
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      <span>{product.name}</span>
                    </div>
                  </div>
                  <span
                    className={`${
                      !product.available
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    ${product.base_price}
                  </span>
                </section>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2">
                <div className="flex justify-center items-center gap-2">
                  {product.description && (
                    <p className="w-full text-sm text-muted-foreground">
                      Descripción: {product.description}
                    </p>
                  )}
                  <div className="flex gap-1">
                    <CustomDialog
                      open={open}
                      setOpen={setOpen}
                      modalTitle="Editar producto"
                      modalDescription="Edita el prodcucto seleccionado"
                      icon={<Edit2Icon />}
                    >
                      <FormProduct
                        buttonTitle="Guardar cambios"
                        handleSubmitButton={(data) =>
                          handleEditProduct(data, product.id, businessId)
                        }
                        loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT}
                        defaultValues={{
                          ...product,
                          base_price: `${product.base_price}`,
                        }}
                      />
                    </CustomDialog>
                    <DeleteDialogConfirmation
                      handleContinue={() => handleDeleteProduct(product.id)}
                      description="Esta acción no podrá ser revertida y eliminará completamente el producto seleccionado"
                    />
                  </div>
                </div>
                <OptionGroupList
                  productId={product.id}
                  optionGroups={product.option_groups}
                  productGroupId={product.group_product_id}
                />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-25">
          <p className="text-muted-foreground">No hay productos</p>
        </div>
      )}
    </>
  );
}
