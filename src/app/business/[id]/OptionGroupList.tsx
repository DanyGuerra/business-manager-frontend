"use client";

import { useState, useEffect, useCallback } from "react";
import CustomDialog from "@/components/customDialog";
import { PlusCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormProductOptionGroup, {
  ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";
import {
  CreateOptionGroupDto,
  OptionGroup,
  useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import OptionGroupSelector from "@/components/optionGroupSelector";
import { useBusinessStore } from "@/store/businessStore";
import OptionGroupCard from "@/components/OptionGroupCard";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
  productId: string;
  productGroupId: string;
  isEditMode: boolean;
  onRefresh?: () => void;
};

import { DialogType as CardDialogType } from "@/components/OptionGroupCard";

type DialogType = CardDialogType | "addExistingGroup";

export default function OptionGroupList({
  optionGroups,
  productId,
  isEditMode,
  onRefresh,
}: OptionGroupListProps) {
  const [dialog, setDialog] = useState<DialogType>(null);
  const [isLinkGroupOpen, setIsLinkGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [optionsGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const optionGroupApi = useOptionGroupApi();
  const productOptionGroupApi = useOptionProductGroupApi();

  const closeDialog = () => setDialog(null);

  async function createOptionGroup(dataDto: ProductOptionGroupValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      const dto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      const { data } = await optionGroupApi.create(dto, businessId);
      await productOptionGroupApi.create(
        { product_id: productId, option_group_id: data.id },
        businessId
      );
      toast.success("Opción del producto creada correctamente", {
        style: toastSuccessStyle,
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      closeDialog();
      setIsCreateGroupOpen(false);
    }
  }



  const getOptionsGroupsById = useCallback(async () => {
    try {
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data.data);
    } catch (error) {
      handleApiError(error)
    }
  }, [optionGroupApi, businessId]);

  const handleOpenLinkDialog = async () => {
    await getOptionsGroupsById();
    setIsLinkGroupOpen(true);
  };


  useEffect(() => {
    if (dialog === "addExistingGroup") getOptionsGroupsById();
  }, [dialog, getOptionsGroupsById]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {isEditMode && (
          <div className="w-full flex items-center justify-center gap-2">
            <CustomDialog
              open={isLinkGroupOpen}
              setOpen={setIsLinkGroupOpen}
              modalTitle="Vincular variante"
              modalDescription="Selecciona un grupo de opciones existente"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenLinkDialog();
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Vincular
                </Button>
              }
            >
              <OptionGroupSelector
                setOpen={() => setIsLinkGroupOpen(false)}
                optionGroups={optionsGroups}
                productId={productId}
                onRefresh={onRefresh}
              />
            </CustomDialog>

            <CustomDialog
              open={isCreateGroupOpen}
              setOpen={setIsCreateGroupOpen}
              modalTitle="Crear variante"
              modalDescription="Crea una nueva variante para este producto"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsCreateGroupOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Crear
                </Button>
              }
            >
              <FormProductOptionGroup
                buttonTitle="Crear y Vincular"
                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
                handleSubmitButton={createOptionGroup}
              />
            </CustomDialog>
          </div>
        )}
      </div>

      {optionGroups.length > 0 ? (
        <div className="grid gap-1">
          {optionGroups.map((og) => (
            <OptionGroupCard
              key={og.id}
              og={og}
              productId={productId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center border rounded-lg bg-muted/10 border-dashed px-2 py-6">
          <p className="text-muted-foreground">No hay variantes configuradas para este producto</p>
        </div>
      )}
    </div>
  );
}
