"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductGroup } from "@/lib/useBusinessApi";

import CustomDialog from "@/components/formCustomDialog";
import ProductList from "./ProductList";
import { useState } from "react";
import { Edit2Icon } from "lucide-react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { toast } from "sonner";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";
import { AxiosError } from "axios";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { ProductDto, useProductApi } from "@/lib/useProductApi";

type ProductGroupListProps = {
  productGroups: ProductGroup[];
  getBusiness: () => void;
};

export default function ProductGroupList({
  productGroups,
  getBusiness,
}: ProductGroupListProps) {
  const apiProductGroup = useProductGroupApi();
  const apiProduct = useProductApi();
  const { stopLoading, startLoading } = useLoadingStore();

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
      await getBusiness();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, { style: toastErrorStyle });
      } else {
        toast.error("Algo salió mal, intenta más tarde", {
          style: toastErrorStyle,
        });
      }
    } finally {
      stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
    }
  }

  async function handleUpdate(
    businessId: string,
    productGroupId: string,
    data: ProductGroupValues
  ) {
    try {
      await apiProductGroup.updateProductGroup(
        productGroupId,
        businessId,
        data
      );

      toast.success("Menú actualizado correctamente", {
        style: toastSuccessStyle,
      });

      await getBusiness();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, { style: toastErrorStyle });
      }
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
      const dataFormatted: ProductDto = {
        ...data,
        description: data.description ?? "",
        base_price: priceNumber,
        group_product_id: productGroupId,
      };

      await apiProduct.createProduct(dataFormatted, businessId);
      toast.success("Producto creado", { style: toastSuccessStyle });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, { style: toastErrorStyle });
      }
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
    }
  }

  return (
    <div className="space-y-6">
      {productGroups.map((group) => {
        const [defaultValues, setDefaultValues] = useState<ProductGroupValues>({
          name: group.name,
          description: group.description,
        });

        return (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-bold">{group.name}</span>
                  <span className="flex gap-1 items-center">
                    <CustomDialog
                      onOpenChange={() => {
                        setDefaultValues({
                          name: group.name,
                          description: group.description ?? "",
                        });
                      }}
                      modalTitle="Editar menú"
                      modalDescription="Edita el menú de productos"
                      icon={<Edit2Icon />}
                    >
                      <FormProductGroup
                        buttonTitle="Guardar"
                        loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT_GROUP}
                        handleSubmitButton={(data) => {
                          handleUpdate(group.business_id, group.id, data);
                        }}
                        defaultValues={defaultValues}
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
                <div className="flex items-center gap-2">
                  <div>Productos</div>
                  <CustomDialog
                    modalTitle="Agregar producto"
                    modalDescription="Agrega un producto para tu menú"
                  >
                    <FormProduct
                      buttonTitle="Guardar"
                      loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
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
