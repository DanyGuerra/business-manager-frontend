"use client";

import FormProductOptionGroup, {
  ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toastSuccessStyle } from "@/lib/toastStyles";
import {
  CreateOptionGroupDto,
  OptionGroup,
  useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TabOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const optionGroupApi = useOptionGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();

  async function getOptionsGroups() {
    try {
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data);
      console.log(data);
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleEditGroupOption(
    dataDto: ProductOptionGroupValues,
    optionGroupId: string
  ) {
    try {
      startLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
      const dto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      await optionGroupApi.update(dto, businessId, optionGroupId);
      await getOptionsGroups();
      toast.success("Grupo de opciones actualizado correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
      setActiveModal(null);
    }
  }

  async function deleteOptionGroup(optionGroupId: string) {
    try {
      await optionGroupApi.delete(businessId, optionGroupId);
      await getOptionsGroups();
      toast.success("Grupo de opciones eliminado correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    }
  }

  useEffect(() => {
    getOptionsGroups();
  }, []);

  return (
    <>
      {optionGroups.length > 0 ? (
        <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2">
          {optionGroups.map((og) => {
            return (
              <Card key={og.id}>
                <CardHeader className="w-full">
                  <CardTitle className="flex items-center justify-between">
                    <span>{og.name}</span>
                    <span>
                      <CustomDialog
                        open={activeModal === og.id}
                        setOpen={(state) =>
                          setActiveModal(state ? og.id : null)
                        }
                        modalTitle="Editar grupo de opciones"
                        modalDescription={`Editar grupo de opcioones "${og.name}"`}
                        icon={<Pencil />}
                      >
                        <FormProductOptionGroup
                          buttonTitle="Guardar"
                          loadingKey={LoadingsKeyEnum.UPDATE_GROUP_OPTION}
                          defaultValues={{
                            ...og,
                            max_options: String(og.max_options),
                            min_options: String(og.min_options),
                          }}
                          handleSubmitButton={(data) =>
                            handleEditGroupOption(data, og.id)
                          }
                        />
                      </CustomDialog>
                      <DeleteDialogConfirmation
                        handleContinue={() => deleteOptionGroup(og.id)}
                      />
                    </span>
                  </CardTitle>
                  <CardDescription className="flex gap-2 items-center">
                    <Badge
                      className={
                        og.available
                          ? "bg-green-100 text-green-700 border-green-300 text-xs"
                          : "bg-red-100 text-red-700 border-red-300 text-xs"
                      }
                    >
                      {og.available ? "Disponible" : "No disponible"}
                    </Badge>
                    <div>Maximo: {og.max_options}</div>
                    <div>Minimo: {og.min_options}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-wrap gap-2 w-full">
                  <div>
                    {og.options.length > 0 ? (
                      og.options.map((o) => (
                        <span
                          className="rounded-md border p-2 text-sm"
                          key={o.id}
                        >
                          {o.name} {o.price > 0 && `+ $${o.price}`}
                        </span>
                      ))
                    ) : (
                      <div className="p-2 flex justify-center items-center w-full text-muted-foreground">
                        <div className="w-full">No hay opciones</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-48">
          No hay grupo de opciones
        </div>
      )}
    </>
  );
}
