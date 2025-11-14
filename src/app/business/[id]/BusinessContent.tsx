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
import { Edit2Icon, FilePenIcon } from "lucide-react";
import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { Toggle } from "@/components/ui/toggle";
import { useEditModeStore } from "@/store/editModeStore";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabMenu from "./TabMenu";

export default function BusinessContent({}: {}) {
  const { business, businessId } = useBusinessStore();
  const { isEditMode, setEditMode } = useEditModeStore();
  const businessApi = useBusinessApi();
  const { getBusiness } = useFetchBusiness();
  const router = useRouter();

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

  async function handleDeleteBusiness() {
    try {
      await businessApi.deleteBusiness(businessId);

      toast.success("Se eliminó correctamente el negocio", {
        style: toastSuccessStyle,
      });

      router.push("/profile");
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
                {business?.name}
              </h1>

              {isEditMode && (
                <>
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
                  <DeleteDialogConfirmation
                    handleContinue={handleDeleteBusiness}
                  />
                </>
              )}
            </div>
          </div>
          <Toggle
            className="cursor-pointer"
            pressed={isEditMode}
            onPressedChange={(state) => setEditMode(state)}
            aria-label="Toggle edit mode"
          >
            <FilePenIcon className="h-4 w-4" />
            Modo edición
          </Toggle>
        </div>
        <div className="text-muted-foreground">{business?.address}</div>
      </div>
      <Separator></Separator>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        {/* wrapper que permite scroll en mobile */}
        <div className="overflow-x-auto mx-2 sm:mx-0">
          <TabsList className="flex gap-2 px-2 whitespace-nowrap">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="menus">Menús</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="option-groups">Grupo de opciones</TabsTrigger>
            <TabsTrigger value="rols_users">Usuarios y roles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="orders">Contenido Pedidos</TabsContent>
        <TabsContent value="menus">
          <TabMenu />
        </TabsContent>
        <TabsContent value="products">Contenido Productos</TabsContent>
      </Tabs>
    </section>
  );
}
