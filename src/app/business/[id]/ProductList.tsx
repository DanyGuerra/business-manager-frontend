"use client";

import { Product } from "@/lib/useBusinessApi";
import CustomDialog from "@/components/customDialog";
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
import { Button } from "@/components/ui/button";
import { Edit2Icon, PackageIcon, PlusIcon, Trash2Icon } from "lucide-react";
import ProductDetailSheet from "./ProductDetailSheet";

type ProductListProps = {
  products: Product[];
  productGroupId: string;
};
export default function ProductList({ products, productGroupId }: ProductListProps) {
  const productApi = useProductApi();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
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
      name: data.name,
      available: data.available,
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
      setSelectedProductId(null);
      stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
    }
  }

  return (
    <>
      {products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col h-full rounded-xl border bg-card p-5 hover:shadow-lg transition-all duration-300"
            >
              {!product.available && (
                <div className="absolute top-3 right-3">
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    No disponible
                  </Badge>
                </div>
              )}

              <div className="mb-4 pr-16">
                <h3 className={cn(
                  "font-semibold text-lg leading-tight mb-1",
                  !product.available && "text-muted-foreground line-through decoration-muted-foreground/50"
                )}>
                  {product.name}
                </h3>
                <p className="font-bold text-xl text-primary">
                  ${product.base_price}
                </p>
              </div>

              <div className="flex-1 mb-6">
                {product.description ? (
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Sin descripción
                  </p>
                )}
              </div>

              {product.option_groups && product.option_groups.length > 0 && (
                <div className="mb-4 space-y-1.5 border-t pt-3">
                  {product.option_groups.map((group) => (
                    <div key={group.id} className="text-xs leading-snug">
                      <span className="font-semibold text-foreground/90 mr-1">
                        {group.name}:
                      </span>
                      <span className="text-muted-foreground">
                        {group.options && group.options.length > 0
                          ? group.options.map((opt, index) => (
                            <span
                              key={opt.id}
                              className={cn(
                                !opt.available &&
                                "line-through opacity-50 decoration-muted-foreground"
                              )}
                            >
                              {opt.name}
                              {index < group.options.length - 1 && ", "}
                            </span>
                          ))
                          : "Sin opciones"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto">
                <ProductDetailSheet product={product} />

                {isEditMode && (
                  <div className="flex items-center gap-2 pt-2 border-t mt-2">
                    <CustomDialog
                      open={selectedProductId === product.id}
                      setOpen={(isOpen) =>
                        setSelectedProductId(isOpen ? product.id : null)
                      }
                      modalTitle="Editar producto"
                      modalDescription="Edita el producto seleccionado"
                      icon={<Edit2Icon className="h-3.5 w-3.5" />}
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

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
