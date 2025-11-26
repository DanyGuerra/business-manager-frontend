"use client";

import { Product } from "@/lib/useBusinessApi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import OptionGroupList from "./OptionGroupList";
import CustomDialog from "@/components/customDialog";
import { Edit2Icon, ChevronDown } from "lucide-react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { toast } from "sonner";
import { CreateProductDto, UpdateProductDto, useProductApi } from "@/lib/useProductApi";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { useState } from "react";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useEditModeStore } from "@/store/editModeStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductListProps = {
  products: Product[];
  productGroupId: string;
};
export default function ProductList({ products, productGroupId }: ProductListProps) {
  const productApi = useProductApi();
  const [open, setOpen] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();
  const { isEditMode } = useEditModeStore();

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
        <div className="flex flex-col" >
          {products.map((product) => (
            <Collapsible key={product.id} className="group/collapsible">
              <CollapsibleTrigger
                className={cn(
                  "flex items-center cursor-pointer justify-between w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 text-left group-hover/collapsible:shadow-sm",
                  !product.available && "opacity-75 bg-muted/50"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold text-base",
                          !product.available && "text-muted-foreground line-through"
                        )}
                      >
                        {product.name}
                      </span>
                      {!product.available && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                          No disponible
                        </Badge>
                      )}
                    </div>
                    <div className="font-bold text-primary">
                      ${product.base_price}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-x border-b rounded-b-lg bg-card/50 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 fade-in-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    {product.description ? (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Descripción
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Sin descripción
                      </span>
                    )}
                  </div>

                  {isEditMode && (
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center bg-background p-1 rounded-md border shadow-sm">
                      <CustomDialog
                        open={open}
                        setOpen={setOpen}
                        modalTitle="Editar producto"
                        modalDescription="Edita el producto seleccionado"
                        icon={<Edit2Icon className="h-4 w-4" />}
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
                      <div className="w-px h-4 bg-border" />
                      <DeleteDialogConfirmation
                        handleContinue={() => handleDeleteProduct(product.id)}
                        description="Esta acción no podrá ser revertida y eliminará completamente el producto seleccionado"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <OptionGroupList
                    productId={product.id}
                    optionGroups={product.option_groups}
                    productGroupId={product.id}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium">No hay productos</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Este menú aún no tiene productos agregados.
          </p>

          <CustomDialog
            modalTitle="Agregar producto"
            modalDescription="Agrega un producto para tu menú"
            textButtonTrigger="Agregar producto"
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
