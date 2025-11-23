"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductGroup } from "@/lib/useBusinessApi";

import CustomDialog from "@/components/customDialog";
import ProductList from "./ProductList";
import { Edit2Icon, PlusIcon } from "lucide-react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { handleApiError } from "@/utils/handleApiError";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useEditModeStore } from "@/store/editModeStore";
import { useBusinessStore } from "@/store/businessStore";

type ProductGroupListProps = {
  productGroups: ProductGroup[];
};

export default function ProductGroupList({
  productGroups,
}: ProductGroupListProps) {
  const apiProductGroup = useProductGroupApi();
  const apiProduct = useProductApi();
  const { stopLoading, startLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();
  const { isEditMode } = useEditModeStore();

  async function handleDeleteProductGroup(
    productGroupId: string,
    businessId: string
  ) {
    try {
      startLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
      const { message } = await apiProductGroup.deleteProductGroup(
        productGroupId,
        businessId
      );
      toast.success(message, { style: toastSuccessStyle });
      await getBusiness(businessId);
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
    }
  }

  async function handleUpdateProductGroup(
    businessId: string,
    productGroupId: string,
    data: ProductGroupValues
  ) {
    try {
      startLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
      await apiProductGroup.updateProductGroup(
        productGroupId,
        businessId,
        data
      );

      toast.success("Menú actualizado correctamente", {
        style: toastSuccessStyle,
      });

      await getBusiness(businessId);
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
    }
  }

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

      await apiProduct.createProduct([dataFormatted], businessId);
      await getBusiness(businessId);
      toast.success("Producto creado", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {productGroups.map((group) => {
        return (
          <Card
            key={group.id}
            className="overflow-hidden transition-all hover:shadow-md border-muted/60 flex flex-col h-full"
          >
            <CardHeader className="bg-muted/20 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">
                    {group.name}
                  </CardTitle>
                  {group.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {group.description}
                    </CardDescription>
                  )}
                </div>
                {isEditMode && (
                  <div className="flex items-center gap-1 shrink-0">
                    <CustomDialog
                      modalTitle="Editar menú"
                      modalDescription="Edita el menú de productos"
                      icon={<Edit2Icon className="h-4 w-4" />}
                    >
                      <FormProductGroup
                        buttonTitle="Guardar"
                        loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT_GROUP}
                        handleSubmitButton={(data) => {
                          handleUpdateProductGroup(businessId, group.id, data);
                        }}
                        defaultValues={{
                          ...group,
                          description: group.description ?? "",
                        }}
                      />
                    </CustomDialog>
                    <DeleteDialogConfirmation
                      handleContinue={() => {
                        handleDeleteProductGroup(group.id, businessId);
                      }}
                      description="Esta acción no podrá ser revertida y eliminará completamente el menú seleccionado"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4 flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Productos
                  </h3>
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                    {group.products.length}
                  </span>
                </div>
                {isEditMode && (
                  <CustomDialog
                    modalTitle="Agregar producto"
                    modalDescription="Agrega un producto para tu menú"

                    icon={<PlusIcon />}
                  >
                    <FormProduct
                      buttonTitle="Guardar"
                      loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                      handleSubmitButton={(data) =>
                        handleCreateProduct(data, businessId, group.id)
                      }
                    ></FormProduct>
                  </CustomDialog>)}
              </div>
              <div className="flex-1">
                <ProductList products={group.products} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
