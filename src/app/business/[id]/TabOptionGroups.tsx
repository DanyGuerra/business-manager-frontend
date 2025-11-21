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
              <Card
                key={og.id}
                className="overflow-hidden transition-all hover:shadow-md border-muted/60"
              >
                <CardHeader className="bg-muted/20 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg font-semibold">
                          {og.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            og.available
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
                          }
                        >
                          {og.available ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                          <span className="font-medium text-foreground">
                            Min:
                          </span>
                          <span>{og.min_options}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                          <span className="font-medium text-foreground">
                            Max:
                          </span>
                          <span>{og.max_options}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <CustomDialog
                        open={activeModal === og.id}
                        setOpen={(state) =>
                          setActiveModal(state ? og.id : null)
                        }
                        modalTitle="Editar grupo de opciones"
                        modalDescription={`Editar grupo de opcioones "${og.name}"`}
                        icon={<Pencil className="h-4 w-4" />}
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-4">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      Opciones
                      <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                        {og.options.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {og.options.length > 0 ? (
                        og.options.map((o) => (
                          <Badge
                            key={o.id}
                            variant="secondary"
                            className="px-2.5 py-1 text-sm font-normal bg-secondary/50 hover:bg-secondary transition-colors border-transparent hover:border-border border"
                          >
                            {o.name}
                            {o.price > 0 && (
                              <span className="ml-1.5 font-semibold text-primary">
                                +${o.price}
                              </span>
                            )}
                          </Badge>
                        ))
                      ) : (
                        <div className="w-full py-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed gap-1">
                          <span className="text-sm">
                            No hay opciones configuradas
                          </span>
                        </div>
                      )}
                    </div>
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
