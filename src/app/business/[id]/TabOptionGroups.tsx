"use client";

import FormProductOptionGroup, {
  ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import {
  CreateOptionGroupDto,
  OptionGroup,
  useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEditModeStore } from "@/store/editModeStore";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProductOptionApi } from "@/lib/useOptionApi";
import OptionGroupCard from "@/components/OptionGroupCard";
import { Skeleton } from "@/components/ui/skeleton";



export default function TabOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const optionGroupApi = useOptionGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore();


  async function getOptionsGroups() {
    try {
      setIsLoading(true);
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createOptionGroup(dataDto: ProductOptionGroupValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      const dto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      await optionGroupApi.create(dto, businessId);
      await getOptionsGroups();
      toast.success("Grupo de opciones creado correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
    }
  }


  useEffect(() => {
    getOptionsGroups();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          Grupo de opciones
        </h2>
        {isEditMode && (
          <CustomDialog
            modalTitle="Crear variante del producto"
            modalDescription="Crea un nuevo grupo de opciones para este producto"
          >
            <FormProductOptionGroup
              buttonTitle="Agregar"
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
              handleSubmitButton={createOptionGroup}
            />
          </CustomDialog>
        )}
      </div>
      {isLoading ? (
        <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : optionGroups.length > 0 ? (
        <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          {optionGroups.map((og) => {
            return (
              <OptionGroupCard
                key={og.id}
                og={og}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed w-full mt-4">
          <div className="bg-background p-3 rounded-full shadow-sm mb-4">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay grupos de opciones</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Crea grupos de opciones para personalizar tus productos.
          </p>

          <CustomDialog
            modalTitle="Crear grupo de opciones"
            modalDescription="Crea un nuevo grupo de opciones para tus productos"
            textButtonTrigger="Crear grupo de opciones"
          >
            <FormProductOptionGroup
              buttonTitle="Agregar"
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
              handleSubmitButton={createOptionGroup}
            />
          </CustomDialog>

        </div >
      )
      }
    </section >
  );
}
