"use client";

import { useFetchBusiness } from "@/app/hooks/useBusiness";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import ProductGroupList from "./ProductGroupList";
import { useEditModeStore } from "@/store/editModeStore";
import { BookOpen } from "lucide-react";

export default function TabMenu() {
  const productGroupApi = useProductGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { business, businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();
  const { isEditMode } = useEditModeStore()

  const handleCreateProduct = async (data: ProductGroupValues) => {
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
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-4">
        <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          Menús
        </h2>

        {isEditMode && (
          <CustomDialog
            modalTitle="Crear menú"
            modalDescription="Crea un menú de productos para tu negocio"
          >
            <FormProductGroup
              buttonTitle="Crear"
              handleSubmitButton={handleCreateProduct}
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP}
            />
          </CustomDialog>)}
      </div>

      {business && business?.product_group.length > 0 ? (
        <ProductGroupList
          productGroups={business.product_group}
        ></ProductGroupList>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
          <div className="bg-background p-3 rounded-full shadow-sm mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay menús disponibles</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Comienza creando un menú para organizar tus productos.
          </p>

          <CustomDialog
            modalTitle="Crear menú"
            modalDescription="Crea un menú de productos para tu negocio"
            textButtonTrigger="Crear primer menú"
          >
            <FormProductGroup
              buttonTitle="Crear"
              handleSubmitButton={handleCreateProduct}
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP}
            />
          </CustomDialog>

        </div>
      )}
    </div>
  );
}
