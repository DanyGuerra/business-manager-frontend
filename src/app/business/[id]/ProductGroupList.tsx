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
import { Edit2Icon } from "lucide-react";
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

type ProductGroupListProps = {
  productGroups: ProductGroup[];
};

export default function ProductGroupList({
  productGroups,
}: ProductGroupListProps) {
  const apiProductGroup = useProductGroupApi();
  const apiProduct = useProductApi();
  const { stopLoading, startLoading } = useLoadingStore();
  const { getBusiness } = useFetchBusiness();

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

      await apiProduct.createProduct(dataFormatted, businessId);
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
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{group.name}</span>
                  <span className="flex gap-1 items-center">
                    <CustomDialog
                      modalTitle="Editar menú"
                      modalDescription="Edita el menú de productos"
                      icon={<Edit2Icon />}
                    >
                      <FormProductGroup
                        buttonTitle="Guardar"
                        loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT_GROUP}
                        handleSubmitButton={(data) => {
                          handleUpdateProductGroup(
                            group.business_id,
                            group.id,
                            data
                          );
                        }}
                        defaultValues={{
                          ...group,
                          description: group.description ?? "",
                        }}
                      />
                    </CustomDialog>
                    <DeleteDialogConfirmation
                      handleContinue={() => {
                        handleDeleteProductGroup(group.id, group.business_id);
                      }}
                      description="Esta acción no podrá ser revertida y eliminará completamente el menú seleccionado"
                    />
                  </span>
                </div>
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="text-lg">Productos</div>
                  <CustomDialog
                    modalTitle="Agregar producto"
                    modalDescription="Agrega un producto para tu menú"
                  >
                    <FormProduct
                      buttonTitle="Guardar"
                      loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                      handleSubmitButton={(data) =>
                        handleCreateProduct(data, group.business_id, group.id)
                      }
                    ></FormProduct>
                  </CustomDialog>
                </div>
              </CardTitle>
              <ProductList products={group.products} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
