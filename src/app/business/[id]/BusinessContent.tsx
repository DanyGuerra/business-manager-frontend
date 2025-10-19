"use client";

import { useBusinessApi } from "@/lib/useBusinessApi";
import { Separator } from "@/components/ui/separator";
import ProductGroupList from "./ProductGroupList";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import React from "react";
import CustomDialog from "@/components/customDialog";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { Edit2Icon } from "lucide-react";
import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";

export default function BusinessContent({}: {}) {
  const productGroupApi = useProductGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { business, businessId } = useBusinessStore();
  const businessApi = useBusinessApi();
  const { getBusiness } = useFetchBusiness();

  const handleSubmitButton = async (data: ProductGroupValues) => {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP);
      await productGroupApi.createProductGroup(
        { ...data, description: data.description ?? "" },
        businessId
      );
      await getBusiness(businessId);
      toast.error("Menú creado", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP);
    }
  };

  async function handleUpdateBusiness(
    data: CreateBusinessValues,
    businessId: string
  ) {
    try {
      await businessApi.updateBusiness(businessId, data);
      await getBusiness(businessId);

      toast.success("Se actualizó correctamente el negocio", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
            {business?.name}
          </h1>
          <CustomDialog
            modalTitle="Editar negocio"
            modalDescription="Edita los datos de tu negocio"
            icon={<Edit2Icon />}
          >
            <FormBusiness
              buttonTitle="Guardar"
              handleSubmitButton={(data) =>
                handleUpdateBusiness(data, businessId)
              }
              loadingKey={LoadingsKeyEnum.UPDATE_BUSINESS}
              defaultValues={{
                name: business?.name ?? "",
                address: business?.address,
              }}
            ></FormBusiness>
          </CustomDialog>
        </div>
        <div className="text-muted-foreground">{business?.address}</div>
      </div>
      <Separator></Separator>

      {/* Menus */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <h2 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
            Menus
          </h2>
          <CustomDialog
            modalTitle="Crear menú"
            modalDescription="Crea un menú de productos para tu negocio"
          >
            <FormProductGroup
              buttonTitle="Crear"
              handleSubmitButton={handleSubmitButton}
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP}
            />
          </CustomDialog>
        </div>

        {business && business?.productGroup.length > 0 ? (
          <ProductGroupList
            productGroups={business.productGroup}
          ></ProductGroupList>
        ) : (
          <div className="flex w-full h-100 items-center justify-center">
            <h1>No hay menus</h1>
          </div>
        )}
      </div>
    </section>
  );
}
